export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabasePublicConfig(
  environment: NodeJS.ProcessEnv = process.env,
): SupabasePublicConfig | undefined {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) return undefined;

  try {
    new URL(url);
  } catch {
    return undefined;
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured(
  environment: NodeJS.ProcessEnv = process.env,
): boolean {
  return getSupabasePublicConfig(environment) !== undefined;
}
