import SunMark from "./SunMark";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__sprocket" aria-hidden="true" />

      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <div className="footer__brand">
            <SunMark size={20} className="footer__icon" />
            <span>Storyang Filipino</span>
          </div>
          <p className="footer__desc">
            Isang dokumentaryong arkibo ng tatlong kwentong Pilipino — itinago sa pelikula,
            handang ibahagi. Libreng panoorin, walang kailangang account.
          </p>
        </div>

        <nav className="footer__col">
          <p className="eyebrow footer__heading">Ang Arkibo</p>
          <ul className="footer__links">
            <li>
              <a href="#mga-kwento">Tatlong Kwento</a>
            </li>
            <li>
              <a href="#mga-kwento">I-scan ang QR</a>
            </li>
            <li>
              <a href="/">Tungkol sa Proyekto</a>
            </li>
          </ul>
        </nav>

        <div className="footer__col">
          <p className="eyebrow footer__heading">Para sa mga Guro</p>
          <p className="footer__note">
            Mga dokumentaryong galing sa pampublikong arkibo at lokal na pananaliksik. Libreng
            ipamahagi sa silid-aralan — i-print lang ang QR ng bawat reel.
          </p>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copy">Bukas para sa lahat, walang login.</p>
        <p className="footer__copy">&copy; {new Date().getFullYear()} Storyang Filipino</p>
      </div>
    </footer>
  );
}