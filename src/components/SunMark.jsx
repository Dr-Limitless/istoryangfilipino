// The eight-ray sun from the Philippine flag, rendered as pure line art.
// No color is used here on purpose — only the form is borrowed, not the
// gold of the original — to keep the strict black-and-white brief while
// still grounding the design in something unmistakably Filipino.
export default function SunMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="square">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 22;
          const y1 = 50 + Math.sin(rad) * 22;
          const x2 = 50 + Math.cos(rad) * 46;
          const y2 = 50 + Math.sin(rad) * 46;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
        <circle cx="50" cy="50" r="14" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
