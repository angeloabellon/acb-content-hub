import { tokenizeCommunityMentions } from "@/lib/community-mentions";
import type { CommunityMention } from "@/data/community";

type CommunityMessageBodyProps = {
  body: string;
  mentions?: CommunityMention[];
};

/** Renders only resolved handles as mentions; all content remains React-escaped text. */
export function CommunityMentionText({
  value,
  mentions = [],
}: { value: string; mentions?: CommunityMention[] }) {
  const mentionNames = new Map(
    mentions.map((mention) => [
      mention.username.toLowerCase(),
      mention.displayName.trim() || "Miembro de la Comunidad",
    ]),
  );

  return (
    <>
      {tokenizeCommunityMentions(value).map((token, index) => (
        token.type === "mention" && mentionNames.has(token.username) ? (
          <span key={`${token.value}-${index}`} className="rounded bg-orange-300/15 px-1 font-semibold text-orange-200">
            @{mentionNames.get(token.username)}
          </span>
        ) : (
          <span key={`${token.value}-${index}`}>{token.value}</span>
        )
      ))}
    </>
  );
}

export default function CommunityMessageBody({
  body,
  mentions = [],
}: CommunityMessageBodyProps) {
  return (
    <p className="mt-5 whitespace-pre-wrap leading-relaxed text-white/75">
      <CommunityMentionText value={body} mentions={mentions} />
    </p>
  );
}
