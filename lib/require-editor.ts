import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { hasEditorRole, isEditorAuthConfigured } from "@/lib/editor-auth";

export async function requireEditor(callbackUrl: string): Promise<void> {
  if (!isEditorAuthConfigured()) redirect("/editor/login");
  const session = await getServerSession(authOptions);
  if (!hasEditorRole(session)) redirect(`/editor/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
