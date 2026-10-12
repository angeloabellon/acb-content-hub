"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  getCommunityViewer,
} from "@/lib/community";
import {
  COMMUNITY_LOGIN_FAILURE,
  isValidCommunityEmail,
  normalizeCommunityUsername,
  validateCommunityPassword,
  validateCommunityUsername,
} from "@/lib/community-auth";
import { isCommunityRootTopicSlug } from "@/data/community";
import { getSafeCommunityPath } from "@/lib/community-validation";
import type { CommunityActionState } from "@/lib/community-action-state";
import { resolveCommunityLoginEmail } from "@/lib/supabase/admin";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function rawValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function communityAuthOrigin(requestHeaders: Headers): string {
  const origin = requestHeaders.get("origin");
  if (!origin) return siteConfig.url;

  try {
    const candidate = new URL(origin);
    const production = new URL(siteConfig.url);
    const isProductionOrigin = candidate.origin === production.origin;
    const isLocalOrigin = candidate.protocol === "http:"
      && ["localhost", "127.0.0.1"].includes(candidate.hostname);
    if (isProductionOrigin || isLocalOrigin) return candidate.origin;
  } catch {
    // The canonical site URL below is deliberately used for malformed input.
  }

  return siteConfig.url;
}

type CommunityFollowActionResult =
  | { ok: true }
  | { ok: false; message: string };

type CommunityNotificationActionResult =
  | { ok: true }
  | { ok: false; message: string };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function revalidateCommunityFollowViews(topicSlug: string) {
  revalidatePath("/comunidad");
  revalidatePath(`/comunidad/tema/${topicSlug}`);
}

function revalidateCommunityNotificationViews() {
  revalidatePath("/", "layout");
}

async function getFollowActionContext(topicId: string, topicSlug: string): Promise<
  | { ok: true; viewerId: string; supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>> }
  | { ok: false; message: string }
> {
  if (!isUuid(topicId)) {
    return { ok: false, message: "No se ha reconocido el tema." };
  }
  if (!isCommunityRootTopicSlug(topicSlug)) {
    return { ok: false, message: "Solo se pueden seguir las conversaciones principales." };
  }

  const viewer = await getCommunityViewer();
  if (!viewer) {
    return { ok: false, message: "Inicia sesión para gestionar el seguimiento." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "El backend de Comunidad aún no está configurado." };
  }

  return { ok: true, viewerId: viewer.id, supabase };
}

export async function followCommunityTopic(
  topicId: string,
  topicSlug: string,
): Promise<CommunityFollowActionResult> {
  const context = await getFollowActionContext(topicId, topicSlug);
  if (!context.ok) return context;

  const { error } = await context.supabase.from("community_topic_follows").insert({
    topic_id: topicId,
    user_id: context.viewerId,
    last_read_at: new Date().toISOString(),
  });

  if (error && error.code !== "23505") {
    return { ok: false, message: "No se ha podido seguir el tema. Inténtalo de nuevo." };
  }

  revalidateCommunityFollowViews(topicSlug);
  return { ok: true };
}

export async function unfollowCommunityTopic(
  topicId: string,
  topicSlug: string,
): Promise<CommunityFollowActionResult> {
  const context = await getFollowActionContext(topicId, topicSlug);
  if (!context.ok) return context;

  const { error } = await context.supabase
    .from("community_topic_follows")
    .delete()
    .eq("topic_id", topicId)
    .eq("user_id", context.viewerId);

  if (error) {
    return { ok: false, message: "No se ha podido dejar de seguir el tema. Inténtalo de nuevo." };
  }

  revalidateCommunityFollowViews(topicSlug);
  return { ok: true };
}

export async function markCommunityTopicRead(
  topicId: string,
  topicSlug: string,
): Promise<CommunityFollowActionResult> {
  const context = await getFollowActionContext(topicId, topicSlug);
  if (!context.ok) return context;

  const { error } = await context.supabase
    .from("community_topic_follows")
    .update({ last_read_at: new Date().toISOString() })
    .eq("topic_id", topicId)
    .eq("user_id", context.viewerId);

  if (error) {
    return { ok: false, message: "No se ha podido actualizar la lectura del tema." };
  }

  revalidateCommunityFollowViews(topicSlug);
  return { ok: true };
}

async function getNotificationActionContext(): Promise<
  | { ok: true; viewerId: string; supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>> }
  | { ok: false; message: string }
> {
  const viewer = await getCommunityViewer();
  if (!viewer) return { ok: false, message: "Inicia sesión para gestionar tus avisos." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "El backend de Comunidad aún no está configurado." };

  return { ok: true, viewerId: viewer.id, supabase };
}

export async function markCommunityNotificationRead(
  notificationId: string,
): Promise<CommunityNotificationActionResult> {
  if (!isUuid(notificationId)) return { ok: false, message: "No se ha reconocido el aviso." };
  const context = await getNotificationActionContext();
  if (!context.ok) return context;

  const { error } = await context.supabase
    .from("community_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", context.viewerId);

  if (error) return { ok: false, message: "No se ha podido marcar el aviso como leído." };
  revalidateCommunityNotificationViews();
  return { ok: true };
}

export async function markAllCommunityNotificationsRead(): Promise<CommunityNotificationActionResult> {
  const context = await getNotificationActionContext();
  if (!context.ok) return context;

  const { error } = await context.supabase
    .from("community_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", context.viewerId)
    .is("read_at", null);

  if (error) return { ok: false, message: "No se han podido marcar los avisos como leídos." };
  revalidateCommunityNotificationViews();
  return { ok: true };
}

function communityAuthCallback(origin: string, next: string): string {
  const callback = new URL("/comunidad/auth/callback", origin);
  callback.searchParams.set("next", next);
  return callback.toString();
}

/** Logs in by a public username without ever returning its backing email. */
export async function signInCommunityWithPassword(
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

  const username = normalizeCommunityUsername(textValue(formData, "username"));
  const password = rawValue(formData, "password");
  if (!username || !password) {
    return { status: "error", message: COMMUNITY_LOGIN_FAILURE };
  }

  const next = getSafeCommunityPath(textValue(formData, "next"));
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "No se pudo preparar el acceso de Comunidad." };
  }

  // The resolver is service-role-only. A non-existent username intentionally
  // performs the same password attempt with a sink address, then receives the
  // exact same generic error as a wrong password.
  const resolvedEmail = await resolveCommunityLoginEmail(username);
  const loginEmail = resolvedEmail ?? "unknown-community-login@invalid.example";

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  if (error) {
    return { status: "error", message: COMMUNITY_LOGIN_FAILURE };
  }

  redirect(next);
}

export async function registerCommunityAccount(
  _: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "El acceso de Comunidad aún no está configurado." };
  }
  if (await getCommunityViewer()) redirect("/comunidad");

  const username = normalizeCommunityUsername(textValue(formData, "username"));
  const usernameError = validateCommunityUsername(username);
  if (usernameError) return { status: "error", message: usernameError };

  const email = textValue(formData, "email").toLowerCase();
  if (!isValidCommunityEmail(email)) {
    return { status: "error", message: "Introduce un correo electrónico válido." };
  }

  const password = rawValue(formData, "password");
  const passwordConfirmation = rawValue(formData, "passwordConfirmation");
  const passwordError = validateCommunityPassword(password);
  if (passwordError) return { status: "error", message: passwordError };
  if (password !== passwordConfirmation) {
    return { status: "error", message: "Las contraseñas no coinciden." };
  }

  const next = getSafeCommunityPath(textValue(formData, "next"));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "No se pudo preparar el registro." };

  const callback = communityAuthCallback(communityAuthOrigin(await headers()), next);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callback,
      data: { username, display_name: username },
    },
  });

  if (error) {
    return {
      status: "error",
      message: "No se ha podido crear la cuenta. Comprueba que el usuario esté disponible e inténtalo de nuevo.",
    };
  }

  return {
    status: "success",
    message: "Revisa tu correo para confirmar la cuenta antes de acceder.",
  };
}

export async function requestCommunityPasswordReset(
  _: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "El acceso de Comunidad aún no está configurado." };
  }

  const email = textValue(formData, "email").toLowerCase();
  if (!isValidCommunityEmail(email)) {
    return { status: "error", message: "Introduce un correo electrónico válido." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "No se pudo preparar la recuperación." };

  const callback = communityAuthCallback(
    communityAuthOrigin(await headers()),
    "/comunidad/nueva-contrasena",
  );
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback });

  // Supabase deliberately does not disclose whether the address is registered.
  return {
    status: "success",
    message: "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.",
  };
}

export async function updateCommunityPassword(
  _: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  if (!await getCommunityViewer()) {
    return { status: "error", message: "El enlace de recuperación no es válido o ha caducado." };
  }

  const password = rawValue(formData, "password");
  const passwordConfirmation = rawValue(formData, "passwordConfirmation");
  const passwordError = validateCommunityPassword(password);
  if (passwordError) return { status: "error", message: passwordError };
  if (password !== passwordConfirmation) {
    return { status: "error", message: "Las contraseñas no coinciden." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "No se pudo actualizar la contraseña." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: "No se ha podido actualizar la contraseña. Inténtalo de nuevo." };

  revalidatePath("/", "layout");
  redirect("/comunidad");
}

/** Ends only the session in this browser and clears its Supabase cookies. */
export async function signOutCommunity() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut({ scope: "local" });
  }

  revalidatePath("/", "layout");
  redirect("/comunidad");
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

  if (!isUuid(topicId)) {
    return { status: "error", message: "No se ha reconocido el tema al que quieres responder." };
  }
  if (!isCommunityRootTopicSlug(topicSlug)) {
    return { status: "error", message: "Solo se puede responder en las conversaciones principales." };
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
