"use client";

import { useActionState, useEffect, useRef, useSyncExternalStore, type FormEvent } from "react";

import { requestCommunitySignIn } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";
import {
  COMMUNITY_ACCESS_COOLDOWN_STORAGE_KEY,
  createCommunityAccessCooldownUntil,
  getCommunityAccessCooldownRemainingSeconds,
  getStoredCommunityAccessCooldownUntil,
} from "@/lib/community-access-cooldown";

type CommunityAccessFormProps = {
  next: string;
};

const COMMUNITY_ACCESS_COOLDOWN_CHANGE_EVENT = "ctc-community-access-cooldown-change";
const EMPTY_COOLDOWN_SNAPSHOT = "";

function getCooldownSnapshot(): string {
  const now = Date.now();
  const cooldownUntil = getStoredCommunityAccessCooldownUntil(
    window.sessionStorage.getItem(COMMUNITY_ACCESS_COOLDOWN_STORAGE_KEY),
    now,
  );

  if (!cooldownUntil) return EMPTY_COOLDOWN_SNAPSHOT;

  return `${cooldownUntil}:${getCommunityAccessCooldownRemainingSeconds(cooldownUntil, now)}`;
}

function subscribeToCooldown(onStoreChange: () => void) {
  const notify = () => onStoreChange();
  const interval = window.setInterval(notify, 1_000);

  window.addEventListener("storage", notify);
  window.addEventListener(COMMUNITY_ACCESS_COOLDOWN_CHANGE_EVENT, notify);

  return () => {
    window.clearInterval(interval);
    window.removeEventListener("storage", notify);
    window.removeEventListener(COMMUNITY_ACCESS_COOLDOWN_CHANGE_EVENT, notify);
  };
}

function getServerCooldownSnapshot() {
  return EMPTY_COOLDOWN_SNAPSHOT;
}

function useCommunityAccessCooldownSeconds(): number {
  const snapshot = useSyncExternalStore(
    subscribeToCooldown,
    getCooldownSnapshot,
    getServerCooldownSnapshot,
  );

  if (!snapshot) return 0;

  const separator = snapshot.lastIndexOf(":");
  const seconds = Number(snapshot.slice(separator + 1));
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : 0;
}

export default function CommunityAccessForm({ next }: CommunityAccessFormProps) {
  const [state, formAction, pending] = useActionState(
    requestCommunitySignIn,
    initialCommunityActionState,
  );
  const submittedRef = useRef(false);
  const cooldownSeconds = useCommunityAccessCooldownSeconds();
  const isCoolingDown = cooldownSeconds > 0;

  useEffect(() => {
    if (pending || !submittedRef.current) return;

    submittedRef.current = false;
    if (state.status !== "success") return;

    const now = Date.now();
    const nextCooldownUntil = createCommunityAccessCooldownUntil(now);
    window.sessionStorage.setItem(
      COMMUNITY_ACCESS_COOLDOWN_STORAGE_KEY,
      String(nextCooldownUntil),
    );
    window.dispatchEvent(new Event(COMMUNITY_ACCESS_COOLDOWN_CHANGE_EVENT));
  }, [pending, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isCoolingDown) {
      event.preventDefault();
      return;
    }

    submittedRef.current = true;
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="community-email" className="mb-2 block text-sm font-semibold text-white/80">
          Correo electrónico
        </label>
        <input
          id="community-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60"
        />
      </div>

      {state.message && (
        <p className={state.status === "error" ? "text-sm text-red-200" : "text-sm text-emerald-200"} aria-live="polite">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || isCoolingDown}
        aria-describedby={isCoolingDown ? "community-access-cooldown" : undefined}
        className="w-full rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando enlace…" : "Continuar con correo"}
      </button>

      {isCoolingDown && (
        <p
          id="community-access-cooldown"
          className="rounded-xl border border-orange-400/20 bg-orange-400/[0.06] px-4 py-3 text-center text-sm font-medium text-orange-100/85"
          aria-live="off"
        >
          Podrás solicitar otro enlace en {cooldownSeconds} s.
        </p>
      )}
    </form>
  );
}
