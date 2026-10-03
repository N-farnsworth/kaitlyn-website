export type Editorial = {
  slug: string;
  title: string;
  summary: string;
  cover: {
    src: string;
    alt: string;
    // Which part of the photo stays in view when it's cropped
    focus?: string;
    // "contain" shows the whole image on a taupe background (used for the book cover)
    fit?: "cover" | "contain";
  };
  /** Handwritten note shown on hover. Use "|" for a line break. */
  note: string;
  /** Doodle drawn after the note (keys of `doodles` in lib/squiggles.ts) */
  doodle: "volleyball" | "wrench" | "cloche" | "shootingStar";
};

export const editorials: Editorial[] = [
  {
    slug: "koll",
    title: "Koll",
    summary:
      "Koll’s NIL partnership with two Texas A&M volleyball players, built around the shared values of character, service, and excellence to connect athletics with interior design.",
    cover: {
      src: "/images/editorials/koll.jpg",
      alt: "Two hands with taped fingers setting a white volleyball against a black background",
    },
    note: "more than a game",
    doodle: "volleyball",
  },
  {
    slug: "malek",
    title: "Malek",
    summary:
      "A long-term brand partnership focused on building trust through consistent, approachable content across social, video, and seasonal campaigns.",
    cover: {
      src: "/images/editorials/malek.jpg",
      alt: "A Malek service van with blue and green branding parked on a residential street",
      focus: "30% 50%",
    },
    note: "expertise you|can feel",
    doodle: "wrench",
  },
  {
    slug: "admiral-catering",
    title: "Admiral Catering",
    summary:
      "A developing brand given room to grow through thoughtful, flexible creative across social, display, and OTT.",
    cover: {
      src: "/images/editorials/admiral-catering.jpg",
      alt: "A server holding a tray of smoked salmon blini outdoors",
      focus: "50% 60%",
    },
    note: "here for any|occasion",
    doodle: "cloche",
  },
  {
    slug: "finding-our-way",
    title: "Finding Our Way",
    summary:
      "A visual storytelling system designed to mirror the reader’s journey from scattered ideas to greater clarity, connection, and shared understanding.",
    cover: {
      src: "/images/editorials/finding-our-way.jpg",
      alt: "Cover of the book Finding Our Way: Developing a Shared Pedagogy",
      fit: "contain",
    },
    note: "find your way",
    doodle: "shootingStar",
  },
];

export function getEditorial(slug: string) {
  return editorials.find((e) => e.slug === slug);
}