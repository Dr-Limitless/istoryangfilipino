import { useEffect, useRef, useState } from "react";
import { heroSlides } from "../data/heroSlides";
import "./HeroSlideshow.css";

const AUTO_MS = 5500;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const videoRefs = useRef([]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % heroSlides.length),
      AUTO_MS,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  useEffect(() => {
    videoRefs.current.forEach((video, videoIndex) => {
      if (!video) return;
      if (reduceMotion || videoIndex !== index) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    });
  }, [index, reduceMotion]);

  return (
    <div className="hslide">
      <div className="hslide__stage" aria-hidden="true">
        {heroSlides.map((slide, slideIndex) => {
          const isVideo = /\.(mp4|webm|mov)$/i.test(slide.src);
          return (
            <div
              className={`hslide__frame${slideIndex === index ? " is-active" : ""}`}
              key={slide.id}
            >
              {isVideo ? (
                <video
                  ref={(node) => { videoRefs.current[slideIndex] = node; }}
                  src={slide.src}
                  muted
                  loop
                  playsInline
                  preload={slideIndex === 0 ? "auto" : "metadata"}
                />
              ) : (
                <img src={slide.src} alt="" loading={slideIndex === 0 ? "eager" : "lazy"} />
              )}
            </div>
          );
        })}
      </div>
      <div className="hslide__scrim" aria-hidden="true" />
    </div>
  );
}
