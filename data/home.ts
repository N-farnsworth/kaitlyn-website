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