import { editorials } from "@/data/editorials";

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const navLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  {
    label: "Portfolio",
    href: "/portfolio",
    children: [
      ...editorials.map((e) => ({ label: e.title, href: `/portfolio/${e.slug}` })),
      { label: "Gallery", href: "/portfolio/gallery" },
    ],
  },
];

// Pages whose hero is a dark photo, so the nav text should be ivory.
// Every other page gets espresso text. Add pages here as their heroes are built.
export const darkHeroPaths = ["/"];