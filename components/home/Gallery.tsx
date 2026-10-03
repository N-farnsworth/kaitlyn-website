import Link from "next/link";
import { gallerySection } from "@/data/home";
import { heroEdgeVars } from "@/lib/heroEdge";
import BoothStrip from "./BoothStrip";
import { GalleryMotionProvider, PauseButton } from "./GalleryMotion";
import styles from "./Gallery.module.css";

export default function Gallery() {
  return (
    // hero-edge: the footer below tucks up by the hero's edge size, so the
    // bottom padding uses the same size to keep the strips clear of it
    <section
      className={`${styles.gallery} hero-edge`}
      style={heroEdgeVars}
      aria-labelledby="gallery-title"
    >
      <GalleryMotionProvider>
        <div className={styles.header}>
          <h2 id="gallery-title" className={styles.title}>
            {gallerySection.heading}
          </h2>
          <p className={styles.intro}>{gallerySection.intro}</p>
          <div className={styles.actions}>
            <Link href={gallerySection.link.href} className={styles.link}>
              {gallerySection.link.label}
              <span aria-hidden="true">→</span>
            </Link>
            <PauseButton />
          </div>
        </div>

        <div className={styles.strips}>
          {gallerySection.strips.map((strip) => (
            <BoothStrip key={strip.title} strip={strip} />
          ))}
        </div>
      </GalleryMotionProvider>
    </section>
  );
}
