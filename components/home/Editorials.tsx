import Squiggle from "@/components/Squiggle";
import { editorials } from "@/data/editorials";
import { editorialsSection } from "@/data/home";
import { editorialsSeam, seamClipPath } from "@/lib/edges";
import { editorialsHeadingSquiggle, editorialsSeamSquiggle } from "@/lib/squiggles";
import EditorialCard from "./EditorialCard";
import styles from "./Editorials.module.css";

const clipPath = seamClipPath(editorialsSeam, "--editorials-edge", 910, 38);

// Slight tilt on each photo's top edge, like the mockup: [left side, right side]
const tilts = [
  ["7%", "0%"],
  ["3%", "0%"],
  ["0%", "3%"],
  ["8%", "0%"],
] as const;

export default function Editorials() {
  return (
    <div className={styles.wrap}>
      <section className={styles.editorials} style={{ clipPath }} aria-labelledby="editorials-title">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{editorialsSection.eyebrow}</p>
            <h2 id="editorials-title" className={styles.title}>
              {editorialsSection.heading}
              <Squiggle {...editorialsHeadingSquiggle} draw className={styles.headingSquiggle} />
            </h2>
          </div>
          <p className={styles.intro}>{editorialsSection.intro}</p>
        </div>

        <ol className={styles.grid}>
          {editorials.map((editorial, i) => (
            <li key={editorial.slug}>
              <EditorialCard editorial={editorial} index={i} tilt={tilts[i % tilts.length]} />
            </li>
          ))}
        </ol>
      </section>

      {/* Sits on top of the seam, so it isn't cut off by the section's edge */}
      <Squiggle {...editorialsSeamSquiggle} draw preserveAspectRatio="none" className={styles.seamSquiggle} />
    </div>
  );
}