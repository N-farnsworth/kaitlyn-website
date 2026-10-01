"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { navLinks, darkHeroPaths, type NavItem } from "@/data/navigation";
import styles from "./Nav.module.css";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const pathname = usePathname();
  const onDark = darkHeroPaths.includes(pathname);

  return (
    <header className={`${styles.header} ${onDark ? styles.onDark : ""}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.monogram} aria-label="Kaitlyn Jayne, home">
          KJ
        </Link>

        <nav aria-label="Main">
          <ul className={styles.links}>
            {navLinks.map((item) =>
              item.children ? (
                <Dropdown key={item.href} item={item} items={item.children} pathname={pathname} />
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.link} ${isActive(pathname, item.href) ? styles.active : ""}`}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Dropdown({
  item,
  items,
  pathname,
}: {
  item: NavItem;
  items: NavItem[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // While open: close on a click outside, or on the Escape key
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li
      ref={wrapperRef}
      className={styles.dropdown}
      data-open={open}
      onBlur={(e) => {
        // Close when keyboard focus moves outside the dropdown
        if (!wrapperRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href={item.href}
        className={`${styles.link} ${isActive(pathname, item.href) ? styles.active : ""}`}
        aria-current={pathname === item.href ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </Link>

      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Show ${item.label} pages`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg className={styles.chevron} width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      <ul id={menuId} className={styles.menu}>
        {items.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              className={styles.menuLink}
              aria-current={pathname === child.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}