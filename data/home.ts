export const hero = {
  name: ["Kaitlyn", "Jayne"],
  tagline: "Understanding comes before expression.",
  intro: [
    "I’m interested in the bigger picture of a brand; what it stands for, how people experience it, and what makes it memorable.",
    "Before deciding how a brand should show up, I want to understand the people behind it, what matters to them, and the impression they want to leave.",
  ],
  image: {
    src: "/images/home/hero.jpg",
    alt: "Afternoon light falling across framed art above a record player and a pleated lamp",
    width: 1330,
    height: 1182,
    // Which part of the photo stays in view when it's cropped (percent from left / top)
    focus: { x: 50, y: 40 },
    // Pixel row in the photo where the edge's high right end should line up
    // (currently the top of the lamp's brass arm). Update this if the photo changes.
    edgeAnchorY: 729,
  },
};

export const editorialsSection = {
  eyebrow: "Selected work",
  heading: "Editorials",
  intro:
    "Different brands, same curiosity. Each of these editorials explore a unique challenge, audience, and showcases what creative approach I ultimately decided on.",
};

export const aboutSection = {
  eyebrow: "A little bit about me.",
  heading: ["Strategy-minded.", "Story-obsessed."],
  body: [
    "Texas A&M Class of 2027, with a love for the stories – of any and all kinds – details, and decisions that make a brand feel distinct and worth remembering.",
    "More than this, I’m drawn to the thinking behind strong brands just as much as the finished work, and to finding the little things that make people connect with them.",
  ],
  link: { label: "More about me", href: "/about" },
  notes: ["Books.", "Cats.", "Good coffee.", "Board games.", "Big ideas.", "Always curious."],
  image: {
    src: "/images/home/about-kaitlyn.jpg",
    alt: "Kaitlyn smiling down at a black-and-white cat in her arms",
    focus: "53% 35%",
  },
};

export type GalleryPhoto = {
  /** Leave out src to show a placeholder tile */
  src?: string;
  alt: string;
};

export type GalleryStrip = {
  title: string;
  direction: "left" | "right";
  /** Drift speed in CSS pixels per second */
  speed: number;
  photos: GalleryPhoto[];
};

const placeholders = (count: number): GalleryPhoto[] =>
  Array.from({ length: count }, () => ({ alt: "Placeholder" }));

export const gallerySection: {
  heading: string;
  intro: string;
  link: { label: string; href: string };
  strips: GalleryStrip[];
} = {
  heading: "The Gallery",
  intro:
    "A curated collection of previous designs, visuals, imagery, and some behind-the-scenes moments that shapes my creative perspective.",
  link: { label: "Explore the gallery", href: "/portfolio/gallery" },
  // Placeholder titles and tiles until her photos arrive (6+ per strip, ideally 10–15)
  strips: [
    { title: "campaigns", direction: "left", speed: 34, photos: placeholders(10) },
    { title: "behind the scenes", direction: "right", speed: 28, photos: placeholders(10) },
  ],
};
