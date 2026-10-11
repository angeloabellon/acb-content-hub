import { tokenizeCommunityMentions } from "@/lib/community-mentions";

type CommunityMessageBodyProps = {
  body: string;
  mentionUsernames?: string[];
};

/** Renders only resolved handles as mentions; all content remains React-escaped text. */
export function CommunityMentionText({
  value,
  mentionUsernames = [],
}: { value: string; mentionUsernames?: string[] }) {
  const knownUsernames = new Set(mentionUsernames.map((username) => username.toLowerCase()));

  return (
    <>
      {tokenizeCommunityMentions(value).map((token, index) => (
        token.type === "mention" && knownUsernames.has(token.username) ? (
          <span key={`${token.value}-${index}`} className="rounded bg-orange-300/15 px-1 font-semibold text-orange-200">
            {token.value}
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
  mentionUsernames = [],
}: CommunityMessageBodyProps) {
  return (
    <p className="mt-5 whitespace-pre-wrap leading-relaxed text-white/75">
      <CommunityMentionText value={body} mentionUsernames={mentionUsernames} />
    </p>
  );
}
