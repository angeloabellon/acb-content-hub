import { tokenizeCommunityMentions } from "@/lib/community-mentions";
import type { CommunityMention } from "@/data/community";

type CommunityMessageBodyProps = {
  body: string;
  legacyTitle?: string;
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
  legacyTitle,
  mentions = [],
}: CommunityMessageBodyProps) {
  return (
    <div className="mt-5">
      {legacyTitle ? (
        <h3 className="mb-3 border-l-2 border-orange-300/70 pl-3 text-base font-bold leading-snug text-orange-100 sm:text-lg">
          <CommunityMentionText value={legacyTitle} mentions={mentions} />
        </h3>
      ) : null}
      <p className="whitespace-pre-wrap leading-relaxed text-white/75">
        <CommunityMentionText value={body} mentions={mentions} />
      </p>
    </div>
  );
}
