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
      { label: "Editorial 1", href: "/portfolio/editorial-1" },
      { label: "Editorial 2", href: "/portfolio/editorial-2" },
      { label: "Editorial 3", href: "/portfolio/editorial-3" },
      { label: "Editorial 4", href: "/portfolio/editorial-4" },
      { label: "Gallery", href: "/portfolio/gallery" },
    ],
  },
];

// Pages whose hero is a dark photo, so the nav text should be ivory.
// Every other page gets espresso text. Add pages here as their heroes are built.
export const darkHeroPaths = ["/"];