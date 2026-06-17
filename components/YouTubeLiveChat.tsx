"use client";

import { useEffect, useState } from "react";

type YouTubeLiveChatProps = {
  videoId: string;
};

export default function YouTubeLiveChat({ videoId }: YouTubeLiveChatProps) {
  const [chatUrl, setChatUrl] = useState("");

  useEffect(() => {
    const embedDomain = window.location.hostname;

    setChatUrl(
      `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}`
    );
  }, [videoId]);

  if (!chatUrl) {
    return (
      <div className="flex h-[500px] items-center justify-center text-sm text-white/50 lg:h-full">
        Cargando chat...
      </div>
    );
  }

  return (
    <iframe
      className="h-[500px] w-full lg:h-full"
      src={chatUrl}
      title="Chat en directo"
    />
  );
}