"use client";

import { useMemo, useState } from "react";

import GalleryCollectionCard from "@/components/GalleryCollectionCard";
import type { GalleryCollection } from "@/data/gallery/types";

type GalleryFiltersProps = {
  collections: GalleryCollection[];
};

const filters = [
  "Todas",
  "UCAM Murcia CB",
  "Unicaja Málaga",
  "Liga Endesa",
  "Afición",
];

export default function GalleryFilters({ collections }: GalleryFiltersProps) {
  const [activeFilter, setActiveFilter] = useState("Todas");

const filteredCollections = useMemo(() => {
  const sortedCollections = [...collections].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;

    return dateB - dateA;
  });

  if (activeFilter === "Todas") return sortedCollections;

  if (activeFilter === "Afición") {
    return sortedCollections.filter((collection) =>
      collection.title.toLowerCase().includes("grada")
    );
  }

  return sortedCollections.filter((collection) => {
    const matchesCompetition = collection.competition === activeFilter;
    const matchesTeam = collection.teams?.includes(activeFilter);

    return matchesCompetition || matchesTeam;
  });
}, [activeFilter, collections]);

  return (
    <section>
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "border-red-700/60 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 text-white shadow-[0_10px_30px_rgba(224,19,16,0.25)]"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:border-red-700/50 hover:text-orange-400"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {filteredCollections.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCollections.map((collection) => (
            <GalleryCollectionCard
              key={collection.slug}
              title={collection.title}
              cover={collection.cover}
              href={`/galeria/${collection.slug}`}
              count={collection.photos.length}
              competition={collection.competition}
              location={collection.location}
              date={collection.date}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-white/70">
            Todavía no hay galerías disponibles para este filtro.
          </p>
        </div>
      )}
    </section>
  );
}