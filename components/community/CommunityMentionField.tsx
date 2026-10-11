"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { CommunityMentionableProfile } from "@/lib/community";
import {
  canonicalCommunityMentionValue,
  emptyCommunityMentionComposer,
  filterCommunityMentionSuggestions,
  getCommunityMentionQuery,
  insertCommunityMention,
  nextCommunityMentionSuggestionIndex,
  updateCommunityMentionComposer,
} from "@/lib/community-mention-composer";

type MentionRequest = {
  profile: CommunityMentionableProfile;
  id: number;
};

type CommunityMentionFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  profiles: CommunityMentionableProfile[];
  minLength: number;
  maxLength: number;
  multiline?: boolean;
  rows?: number;
  requestedMention?: MentionRequest;
};

type TextControl = HTMLInputElement | HTMLTextAreaElement;

const inputClassName = "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60";

export default function CommunityMentionField({
  id,
  name,
  label,
  placeholder,
  profiles,
  minLength,
  maxLength,
  multiline = false,
  rows,
  requestedMention,
}: CommunityMentionFieldProps) {
  const [composer, setComposer] = useState(emptyCommunityMentionComposer);
  const [query, setQuery] = useState<ReturnType<typeof getCommunityMentionQuery>>();
  const [activeIndex, setActiveIndex] = useState(0);
  const controlRef = useRef<TextControl>(null);
  const handledRequest = useRef<number | undefined>(undefined);
  const listboxId = useId();
  const suggestions = query
    ? filterCommunityMentionSuggestions(profiles, query.value)
    : [];
  const activeSuggestion = suggestions[activeIndex];

  function setCursor(cursor: number) {
    requestAnimationFrame(() => {
      controlRef.current?.focus();
      controlRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function chooseSuggestion(profile: CommunityMentionableProfile) {
    if (!query) return;
    const result = insertCommunityMention(composer, query, profile);
    setComposer(result.state);
    setQuery(undefined);
    setActiveIndex(0);
    setCursor(result.cursor);
  }

  useEffect(() => {
    if (!requestedMention || handledRequest.current === requestedMention.id) return;
    handledRequest.current = requestedMention.id;
    const insertionQuery = { start: composer.value.length, end: composer.value.length, value: "" };
    const result = insertCommunityMention(composer, insertionQuery, requestedMention.profile);
    setComposer(result.state);
    setQuery(undefined);
    setCursor(result.cursor);
  }, [composer, requestedMention]);

  function updateQuery(value: string, cursor: number) {
    const nextQuery = getCommunityMentionQuery(value, cursor);
    setQuery(nextQuery);
    setActiveIndex(0);
  }

  function onChange(event: React.ChangeEvent<TextControl>) {
    const value = event.currentTarget.value;
    setComposer((current) => updateCommunityMentionComposer(current, value));
    updateQuery(value, event.currentTarget.selectionStart ?? value.length);
  }

  function onKeyDown(event: React.KeyboardEvent<TextControl>) {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => nextCommunityMentionSuggestionIndex(current, suggestions.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => nextCommunityMentionSuggestionIndex(current, suggestions.length, -1));
    } else if (event.key === "Enter" && activeSuggestion) {
      event.preventDefault();
      chooseSuggestion(activeSuggestion);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setQuery(undefined);
    }
  }

  const controlProps = {
    id,
    value: composer.value,
    onChange,
    onKeyDown,
    onClick: (event: React.MouseEvent<TextControl>) => updateQuery(composer.value, event.currentTarget.selectionStart ?? composer.value.length),
    onKeyUp: (event: React.KeyboardEvent<TextControl>) => updateQuery(composer.value, event.currentTarget.selectionStart ?? composer.value.length),
    onBlur: () => window.setTimeout(() => setQuery(undefined), 120),
    required: true,
    minLength,
    maxLength,
    placeholder,
    autoComplete: "off",
    role: "combobox",
    "aria-autocomplete": "list" as const,
    "aria-controls": suggestions.length ? listboxId : undefined,
    "aria-expanded": suggestions.length > 0,
    "aria-activedescendant": activeSuggestion ? `${listboxId}-${activeIndex}` : undefined,
    className: `${inputClassName}${multiline ? " resize-y" : ""}`,
  };

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor={id}>{label}</label>
      <input type="hidden" name={name} value={canonicalCommunityMentionValue(composer)} />
      {multiline ? (
        <textarea {...controlProps} ref={(node) => { controlRef.current = node; }} rows={rows} />
      ) : (
        <input {...controlProps} ref={(node) => { controlRef.current = node; }} type="text" />
      )}
      {suggestions.length > 0 ? (
        <div id={listboxId} role="listbox" aria-label="Usuarios sugeridos" className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-orange-400/25 bg-[#170606] p-1 shadow-2xl">
          {suggestions.map((profile, index) => (
            <button
              key={profile.id}
              id={`${listboxId}-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${index === activeIndex ? "bg-orange-300/15 text-orange-100" : "text-white/75 hover:bg-white/5"}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(profile)}
            >
              @{profile.displayName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
