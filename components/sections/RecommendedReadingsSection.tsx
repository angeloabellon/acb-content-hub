import ExternalArticleCard from "@/components/cards/ExternalArticleCard";
import { recommendedAuthors } from "@/data/recommendedAuthors";
import { getLatestExternalArticle } from "@/lib/externalArticles";

type RecommendedReadingsSectionProps = {
  className?: string;

  /**
   * Permite ocultar la cabecera de la sección cuando el componente
   * se integra dentro de otro bloque que ya tiene su propio contexto.
   *
   * Ejemplo: en Actualidad queremos mostrar solo la card del artículo,
   * sin repetir títulos como "Firmas invitadas".
   */
  showHeader?: boolean;
};

export default async function RecommendedReadingsSection({
  className = "",
  showHeader = true,
}: RecommendedReadingsSectionProps) {
  // AUTOR RECOMENDADO PRINCIPAL
  const [recommendedAuthor] = recommendedAuthors;

  // ÚLTIMO ARTÍCULO PUBLICADO
  const latestRecommendedArticle = await getLatestExternalArticle(
    recommendedAuthor.url
  );

  return (
    <section className={`max-w-7xl mx-auto px-6 ${className}`}>
      {/* CABECERA DE SECCIÓN */}
      {showHeader && (
        <div className="mb-8">
          <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-3">
            FIRMAS INVITADAS
          </p>

          <h2 className="text-3xl md:text-4xl font-bold">
            Miradas externas sobre el baloncesto
          </h2>
        </div>
      )}

      {/* CARD DE FIRMA INVITADA */}
      <ExternalArticleCard
        authorName={recommendedAuthor.name}
        source={recommendedAuthor.source}
        description={recommendedAuthor.description}
        authorUrl={recommendedAuthor.url}
        latestArticle={latestRecommendedArticle}
      />
    </section>
  );
}