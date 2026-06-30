import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SunMark from "./SunMark";
import "./Navbar.css";

export default function Navbar() {
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
      </div>
    </header>
  );
}