type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-8 md:mb-10 ${className}`}>
      {eyebrow && (
        <p className="uppercase tracking-[0.18em] text-red-300/80 text-xs font-semibold mb-3">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl md:text-4xl font-bold max-w-3xl">
        {title}
      </h2>

      {description && (
        <p className="text-white/70 mt-4 max-w-3xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}