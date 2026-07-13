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
      <div className="hslide__stage" aria-hidden="true">
        {heroSlides.map((slide, i) => {
          const isVideo = /\.(mp4|webm|mov)$/i.test(slide.src);
          return (
            <div
              className={`hslide__frame${i === index ? " is-active" : ""}`}
              key={slide.id}
            >
              {isVideo ? (
                <video
                  src={slide.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={slide.alt}
                />
              ) : (
                <img src={slide.src} alt={slide.alt} loading="eager" />
              )}
            </div>
          );
        })}
      </div>

      <div className="hslide__scrim" aria-hidden="true" />


    </div>
  );
}