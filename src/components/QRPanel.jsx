import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Link2, Check } from "lucide-react";
import { shareUrlFor } from "../lib/video"; /* This is the missing piece! */
import "./QRPanel.css";

export default function QRPanel({ video }) {
  const canvasWrapRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const url = shareUrlFor(video.id);

  function handleDownload() {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    // Updated naming convention since we removed the episode numbers
    link.download = `qr-istoryang-filipino-${video.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — silently ignore, link is still on screen
    }
  }

  return (
    <div className="qrpanel">
      <div className="qrpanel__code" ref={canvasWrapRef}>
        <QRCodeCanvas
          value={url}
          size={208}
          bgColor="#ffffff"
          fgColor="#101014" /* Matches the dark background so the QR pops */
          level="M"
          marginSize={2}
        />
      </div>

      <p className="qrpanel__label">I-scan para Mapanood sa Cellphone</p>
      <p className="qrpanel__url">{url}</p>

      <div className="qrpanel__actions">
        <button type="button" className="qrpanel__btn qrpanel__btn--solid" onClick={handleDownload}>
          <Download size={16} strokeWidth={2.5} />
          I-download
        </button>
        <button type="button" className="qrpanel__btn" onClick={handleCopy}>
          {copied ? <Check size={16} strokeWidth={2.5} /> : <Link2 size={16} strokeWidth={2.5} />}
          {copied ? "Nakopya" : "Kopyahin"}
        </button>
      </div>
    </div>
  );
}