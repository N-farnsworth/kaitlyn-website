import Image from "next/image";
import Link from "next/link";
import { footer } from "@/data/contact";
import { heroEdge, topEdgeClipPath } from "@/lib/edges";
import { heroEdgeVars } from "@/lib/heroEdge";
import styles from "./Footer.module.css";

// Same edge size and shape as the hero's bottom, so the two halves fit
const footerStyle = {
  ...heroEdgeVars,
  clipPath: topEdgeClipPath(heroEdge, "--hero-edge"),
};

const icons = {
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.75v.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.25-2.5S16 11.5 16 13v3" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Z" />
      <path d="M14 3v4.5h4.5M9 12h6M9 15.5h6" />
    </svg>
  ),
};

export default function Footer() {
  return (
    <footer className={`${styles.footer} hero-edge`} style={footerStyle}>
      <div className={styles.media}>
        <Image src={footer.image.src} alt="" fill sizes="100vw" className={styles.image} />
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.heading}>{footer.heading}</h2>
        <ul className={styles.links}>
          {footer.links.map((link) => {
            const content = (
              <>
                <span className={styles.icon}>{icons[link.icon]}</span>
                {link.label}
              </>
            );
            return (
              <li key={link.label}>
                {link.href.startsWith("/") ? (
                  <Link href={link.href} className={styles.link}>
                    {content}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={styles.link}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {content}
                    {"external" in link && link.external && (
                      <span className={styles.srOnly}> (opens in a new tab)</span>
                    )}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className={styles.legal}>
        © {new Date().getFullYear()} {footer.name}
      </p>
    </footer>
  );
}
