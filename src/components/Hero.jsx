import SunMark from "./SunMark";
import HeroSlideshow from "./HeroSlideshow";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__split">
        <div className="hero__text">
          <h1 className="hero__title">
            <span className="hero__title-line">Istoryang</span>
            <span className="hero__title-line hero__title-line--invert">Filipino</span>
          </h1>

          <p className="hero__sub">
            Tatlong kwento, direkta mula sa arkibo,
            handang ibahagi. Panoorin dito, o i-scan ang QR sa bawat reel para mapanood agad
            sa cellphone.
          </p>

          <a href="#mga-kwento" className="hero__cue">
            <SunMark size={20} />
            <span>Simulan</span>
          </a>
        </div>

        <div className="hero__media">
          <HeroSlideshow />
        </div>
      </div>
    </section>
  );
}