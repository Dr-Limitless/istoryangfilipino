import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "../data/heroSlides";
import "./HeroSlideshow.css";

const AUTO_MS = 5500;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((next) => {
    setIndex((prev) => (next + heroSlides.length) % heroSlides.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, AUTO_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="hslide">
      <div
        className="hslide__track"
        style={{ transform: `translateX(-${index * 100}%)` }}
        aria-hidden="true"
      >
        {heroSlides.map((slide) => (
          <div className="hslide__frame" key={slide.id}>
            <img src={slide.src} alt={slide.alt} loading="eager" />
          </div>
        ))}
      </div>

      <div className="hslide__scrim" aria-hidden="true" />

      <button
        type="button"
        className="hslide__arrow hslide__arrow--left"
        onClick={prev}
        aria-label="Nakaraang larawan"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="hslide__arrow hslide__arrow--right"
        onClick={next}
        aria-label="Susunod na larawan"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}