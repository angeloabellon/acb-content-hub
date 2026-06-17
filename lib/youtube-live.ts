import { liveConfig } from "@/config/live";

type YouTubeLiveItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
  };
};

type YouTubeLiveResponse = {
  items?: YouTubeLiveItem[];
};

export type ActiveLiveStream = {
  isLive: boolean;
  videoId: string;
  title: string;
  description: string;
};

const emptyLive: ActiveLiveStream = {
  isLive: false,
  videoId: "",
  title: "",
  description: "",
};

function getManualLiveStream(): ActiveLiveStream {
  if (!liveConfig.isLive || !liveConfig.videoId) {
    return emptyLive;
  }

  return {
    isLive: true,
    videoId: liveConfig.videoId,
    title: liveConfig.title,
    description: liveConfig.description,
  };
}

export async function getActiveLiveStream(): Promise<ActiveLiveStream> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return getManualLiveStream();
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");

  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("eventType", "live");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return getManualLiveStream();
    }

    const data = (await response.json()) as YouTubeLiveResponse;
    const live = data.items?.[0];

    if (!live?.id?.videoId) {
      return getManualLiveStream();
    }

    return {
      isLive: true,
      videoId: live.id.videoId,
      title: live.snippet?.title ?? liveConfig.title,
      description: live.snippet?.description ?? liveConfig.description,
    };
  } catch {
    return getManualLiveStream();
  }
}