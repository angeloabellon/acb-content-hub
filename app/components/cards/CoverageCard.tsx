import Image from "next/image";
import Link from "next/link";

type CoverageCardProps = {
  title: string;
  description: string;
  href: string;
  accent: string;
  teamLogo: string;
  leagueLogo: string;
  leagueLogoSize?: string;
};

export default function CoverageCard({
  title,
  description,
  href,
  accent,
  teamLogo,
  leagueLogo,
  leagueLogoSize = "w-14 h-14",
}: CoverageCardProps) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-6 min-h-56 hover:border-orange-400/60 transition-all duration-300`}
    >
      {/* LOGO DE FONDO */}
      <div className="absolute inset-0 opacity-[0.16]">
        <Image
          src={teamLogo}
          alt={title}
          fill
          className="object-contain p-4 scale-110"
        />
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30" />

      {/* CONTENIDO */}
      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div>
          {/* LOGO LIGA */}
          <div className="mb-5">
            <div className={`relative ${leagueLogoSize}`}>
              <Image
                src={leagueLogo}
                alt={title}
                fill
                className="object-contain opacity-90"
              />
            </div>
          </div>

          {/* TÍTULO */}
          <h3 className="text-2xl font-extrabold mb-3 group-hover:text-orange-300 transition-colors">
            {title}
          </h3>

          {/* DESCRIPCIÓN */}
          <p className="text-sm text-white/75 leading-relaxed max-w-xs">
            {description}
          </p>
        </div>

        {/* CTA */}
        <span className="text-sm font-semibold text-white/80 group-hover:text-orange-300 transition-colors">
          Ver cobertura →
        </span>
      </div>
    </Link>
  );
}