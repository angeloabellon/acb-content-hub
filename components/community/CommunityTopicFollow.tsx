"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  followCommunityTopic,
  markCommunityTopicRead,
  unfollowCommunityTopic,
} from "@/app/comunidad/actions";
import { formatCommunityUnreadReplyCount } from "@/lib/community-follow";

type CommunityTopicFollowProps = {
  topicId: string;
  topicSlug: string;
  isFollowing: boolean;
  unreadReplies: number;
};

export default function CommunityTopicFollow({
  topicId,
  topicSlug,
  isFollowing,
  unreadReplies,
}: CommunityTopicFollowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!isFollowing) return;

    let active = true;
    void markCommunityTopicRead(topicId, topicSlug).then((result) => {
      if (active && result.ok) router.refresh();
    });

    return () => {
      active = false;
    };
  }, [isFollowing, router, topicId, topicSlug]);

  function toggleFollow() {
    startTransition(async () => {
      const result = isFollowing
        ? await unfollowCommunityTopic(topicId, topicSlug)
        : await followCommunityTopic(topicId, topicSlug);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setMessage(undefined);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={isPending}
        className="rounded-xl border border-red-900/40 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-orange-400/40 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Actualizando…" : isFollowing ? "Dejar de seguir" : "Seguir tema"}
      </button>
      {isFollowing && (
        <span className="text-sm text-white/55">
          {unreadReplies > 0
            ? `${formatCommunityUnreadReplyCount(unreadReplies)} respuestas antes de esta visita`
            : "Sigues este tema"}
        </span>
      )}
      {message && <p className="text-sm text-red-200" aria-live="polite">{message}</p>}
    </div>
  );
}
