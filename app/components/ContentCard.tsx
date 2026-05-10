type ContentCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function ContentCard({ title, children }: ContentCardProps) {
  return (
    <section className="bg-[#e0131080] p-6 rounded-2xl mt-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {children}
    </section>
  );
}