import { notFound } from "next/navigation";
import { editorials, getEditorial } from "@/data/editorials";

export const dynamicParams = false;

export function generateStaticParams() {
  return editorials.map((e) => ({ slug: e.slug }));
}

export default async function EditorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const editorial = getEditorial(slug);

  if (!editorial) notFound();

  return (
    <main>
      <h1>{editorial.title}</h1>
      <p>{editorial.summary}</p>
    </main>
  );
}