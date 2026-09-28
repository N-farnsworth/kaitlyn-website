export type Editorial = {
  slug: string;
  title: string;
  summary: string;
};

export const editorials: Editorial[] = [
  { slug: "editorial-1", title: "Editorial 1", summary: "Placeholder text for the first editorial." },
  { slug: "editorial-2", title: "Editorial 2", summary: "Placeholder text for the second editorial." },
  { slug: "editorial-3", title: "Editorial 3", summary: "Placeholder text for the third editorial." },
  { slug: "editorial-4", title: "Editorial 4", summary: "Placeholder text for the fourth editorial." },
];

export function getEditorial(slug: string) {
  return editorials.find((e) => e.slug === slug);
}