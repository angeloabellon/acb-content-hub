"use client";

type ShareButtonProps = {
  title: string;
  url: string;
  text?: string;
};

export default function ShareButton({
  title,
  url,
  text = "Compartir",
}: ShareButtonProps) {
  async function handleShare() {
    const shareData = {
      title,
      text: title,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Compartir cancelado por el usuario.
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    } catch {
      alert("No se pudo copiar el enlace");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-400/10 px-5 py-3 text-sm font-semibold text-orange-300 transition-all hover:bg-orange-400/20"
    >
      {text} →
    </button>
  );
}