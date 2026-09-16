import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Navbar.css";
import { useManual } from "../lib/manualContext";

export default function Navbar() {
  const { openManual } = useManual();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 48);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav__sprocket" aria-hidden="true" />
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <img src="/storyangfilipino logo.png" alt="Storyang Filipino " className="nav__logo" />
          <span className="nav__wordmark">
            Storyang <strong>Filipino</strong>
          </span>
        </Link>
        <nav className="nav__links" aria-label="Pangunahing nabigasyon"><a href="/#mga-kwento">Mga kwento</a><a href="/#talaan">Mga puntos</a><button type="button" onClick={openManual}>Gabay</button></nav>
      </div>
    </header>
  );
}
