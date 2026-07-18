"use client";

import { useEffect, useState } from "react";
import { CookieMark } from "./CookieMark";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#feed", label: "The feed" },
  { href: "#discover", label: "Discover" },
  { href: "#groups", label: "Groups" },
];

export function Header() {
  const [solid, setSolid] = useState(false);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => {
    setShow(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const closeMenu = () => {
    setOpen(false);
    window.setTimeout(() => setShow(false), 350);
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  return (
    <>
      <header id="hdr" className={solid ? "solid" : undefined}>
        <nav className="nav">
          <a className="brand" href="#top">
            <CookieMark />
            Crumbify
          </a>
          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="nav-cta">
            <button className="btn ink">Get the app</button>
          </div>
          <button
            className={`burger${open ? " open" : ""}`}
            id="burger"
            aria-label="Menu"
            onClick={toggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>
      <div className={`mnav${show ? " show" : ""}${open ? " open" : ""}`} id="mnav">
        {NAV_LINKS.map((link) => (
          <a href={link.href} key={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <button className="btn ink">Get the app</button>
      </div>
    </>
  );
}
