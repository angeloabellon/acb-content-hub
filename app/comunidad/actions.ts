"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  getCommunityViewer,
} from "@/lib/community";
import { getSafeCommunityPath, isCommunitySpace } from "@/lib/community-validation";
import type { CommunityActionState } from "@/lib/community-action-state";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function topicSlug(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);

  return `${base || "conversacion"}-${crypto.randomUUID().slice(0, 8)}`;
}

function originForMagicLink(requestHeaders: Headers): string {
  const origin = requestHeaders.get("origin");
  if (origin) return origin;
  return siteConfig.url;
}

export async function requestCommunitySignIn(
  _: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "El acceso de Comunidad aún no está configurado.",
    };
  }

  if (await getCommunityViewer()) {
    redirect("/comunidad");
  }

  const email = textValue(formData, "email").toLowerCase();
  if (!safeEmail(email)) {
    return { status: "error", message: "Introduce un correo electrónico válido." };
  }

  const next = getSafeCommunityPath(textValue(formData, "next"));
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "No se pudo preparar el acceso de Comunidad." };
  }

  const callback = new URL("/comunidad/auth/callback", originForMagicLink(await headers()));
  callback.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback.toString() },
  });

  if (error) {
    return { status: "error", message: "No se ha podido enviar el enlace de acceso. Inténtalo de nuevo." };
  }

  return {
    status: "success",
    message: "Te hemos enviado un enlace de acceso. Revisa tu correo para continuar.",
  };
}

/** Ends only the session in this browser and clears its Supabase cookies. */
export async function signOutCommunity() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut({ scope: "local" });
  }

  revalidatePath("/comunidad");
  redirect("/comunidad");
}

export async function createCommunityTopic(
  _: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const viewer = await getCommunityViewer();
  if (!viewer) {
    return { status: "error", message: "Inicia sesión para publicar un tema." };
  }

  const space = textValue(formData, "space");
  const title = textValue(formData, "title");
  const body = textValue(formData, "body");

  if (!isCommunitySpace(space)) {
    return { status: "error", message: "Elige uno de los dos espacios de Comunidad." };
  }
  if (title.length < 8 || title.length > 140) {
    return { status: "error", message: "El título debe tener entre 8 y 140 caracteres." };
  }
  if (body.length < 12 || body.length > 5000) {
    return { status: "error", message: "El mensaje debe tener entre 12 y 5.000 caracteres." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "El backend de Comunidad aún no está configurado." };
  }

  const slug = topicSlug(title);
  const { error } = await supabase.from("community_topics").insert({
    space_slug: space,
    author_id: viewer.id,
    slug,
    title,
    body,
  });

  if (error) {
    return { status: "error", message: "No se ha podido publicar el tema. Inténtalo de nuevo." };
  }

  revalidatePath("/comunidad");
  revalidatePath(`/comunidad/${space}`);
  redirect(`/comunidad/tema/${slug}`);
}

export async function createCommunityReply(
  topicId: string,
  topicSlug: string,
  _: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const viewer = await getCommunityViewer();
  if (!viewer) {
    return { status: "error", message: "Inicia sesión para responder." };
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(topicId)) {
    return { status: "error", message: "No se ha reconocido el tema al que quieres responder." };
  }

  const body = textValue(formData, "body");
  if (body.length < 2 || body.length > 5000) {
    return { status: "error", message: "La respuesta debe tener entre 2 y 5.000 caracteres." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "El backend de Comunidad aún no está configurado." };
  }

  const { error } = await supabase.from("community_posts").insert({
    topic_id: topicId,
    author_id: viewer.id,
    body,
  });

  if (error) {
    return { status: "error", message: "No se ha podido publicar la respuesta. Inténtalo de nuevo." };
  }

  revalidatePath("/comunidad");
  revalidatePath(`/comunidad/tema/${topicSlug}`);
  return { status: "success", message: "Respuesta publicada." };
}
