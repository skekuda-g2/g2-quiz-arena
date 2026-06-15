export default function G2Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <img src="/g2-logo.svg" width={size} height={size} alt="G2" />
      <span className="font-bold text-white" style={{ fontSize: size * 0.5 }}>
        Quiz Arena
      </span>
    </div>
  );
}
