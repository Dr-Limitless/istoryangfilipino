import { useManual } from "../lib/manualContext";
import HeroSlideshow from "./HeroSlideshow";
import "./Hero.css";

export default function Hero() {
  const { openManual } = useManual();
  return (
    <section className="hero">
      <div className="hero__split">
        <div className="hero__text">
          <h1 className="hero__title">
            <span className="hero__title-line">Storyang</span>
            <span className="hero__title-line hero__title-line--invert">Filipino</span>
          </h1>

          <p className="hero__sub">
            Panoorin ang kwento. Tuklasin ang mga salita.
            Ibahagi ang iyong pagninilay sa tatlong araling Filipino.
          </p>

          <a href="#mga-kwento" className="hero__cue">

            <span>Simulan</span>
          </a>
          <button type="button" onClick={openManual} className="hero__guide">Paano magsimula?</button>
        </div>

        <div className="hero__media">
          <HeroSlideshow />
        </div>
      </div>
    </section>
  );
}
