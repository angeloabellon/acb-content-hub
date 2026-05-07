type ContentCardProps = {
  title: string;
  description: string;
};

export default function ContentCard({
  title,
  description,
}: ContentCardProps) {
  return (
    <section className="card">
      <h2>{title}</h2>

      <p>{description}</p>
    </section>
  );
}