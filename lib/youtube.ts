import he from "he";

type YouTubeThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

type YouTubeVideoItem = {
  id?: {
    videoId?: string;
  };
  snippet: {
    title: string;
    description?: string;
    publishedAt: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails: YouTubeThumbnails;
  };
};

type YouTubeSearchResponse = {
  items: YouTubeVideoItem[];
};

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  slug: string;
  embedUrl: string;
  publishedAt: string;
};


export function createVideoSlug(title: string, id: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    id
  );
}

export function getVideoIdFromSlug(slug: string) {
  return slug.slice(-11);
}

type YouTubeThumbnails = {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
};

function getBestThumbnail(thumbnails: YouTubeThumbnails): string {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
}

export async function getYouTubeVideoById(
  videoId: string
): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  );

  const data = (await response.json()) as YouTubeSearchResponse;

  if (!data.items || data.items.length === 0) {
    return null;
  }

  const item = data.items[0];
  const title = he.decode(item.snippet.title);
  const description = he.decode(item.snippet.description || "");
  const thumbnail = getBestThumbnail(item.snippet.thumbnails);

  return {
    id: videoId,
    title,
    description,
    thumbnail,
    slug: createVideoSlug(title, videoId),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    publishedAt: item.snippet.publishedAt,
  };
}

export async function getLatestYouTubeVideos(
  maxResults = 9
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  );

  const channelData = await channelResponse.json();

  if (!channelData.items || channelData.items.length === 0) {
    return [];
  }

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  );

  const videosData = await videosResponse.json();

  if (!videosData.items) {
    return [];
  }

  return videosData.items
  .map((item: YouTubeVideoItem) => {
    const id = item.snippet.resourceId?.videoId ?? item.id?.videoId;

    if (!id) {
      return null;
    }

    const title = he.decode(item.snippet.title);
    const description = he.decode(item.snippet.description || "");
    const thumbnail = getBestThumbnail(item.snippet.thumbnails);

    return {
      id,
      title,
      description,
      thumbnail,
      url: `https://www.youtube.com/watch?v=${id}`,
      publishedAt: item.snippet.publishedAt,
    };
  })
  .filter((video: null): video is NonNullable<typeof video> => video !== null);
}