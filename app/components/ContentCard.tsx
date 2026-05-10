type ContentCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function ContentCard({ title, children }: ContentCardProps) {
  return (
    <section className="bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 rounded-3xl border border-red-900/40 shadow-2xl p-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {children}
    </section>
  );
}