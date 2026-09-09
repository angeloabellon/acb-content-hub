import { requireEditor } from "@/lib/require-editor";

export default async function EditorialEpisodesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Protects the existing editorial subtree; leaf pages and mutations verify again.
  await requireEditor("/editor/episodios");
  return children;
}
