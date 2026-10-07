/** Fixed site-wide ambient background: gradient orbs, tech grid, grain. */
export default function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,30,74,0.55),_rgba(5,6,15,0.9)_50%)]" />

      {/* soft color orbs */}
      <div className="absolute -top-40 left-1/2 h-[46rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,124,255,0.16),_transparent_65%)] blur-2xl" />
      <div className="absolute -left-40 top-[32rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.12),_transparent_65%)] blur-3xl" />
      <div className="absolute -right-48 top-[88rem] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,_rgba(63,216,255,0.09),_transparent_65%)] blur-3xl" />
      <div className="absolute bottom-[-16rem] left-1/3 h-[40rem] w-[44rem] rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.12),_transparent_65%)] blur-3xl" />

      {/* faint tech grid */}
      <div
        className="absolute inset-0 opacity-[0.05] grid-lines [mask-image:radial-gradient(ellipse_at_center,_black,_transparent_78%)]"
      />

      {/* drifting grain */}
      <div className="absolute inset-0 opacity-[0.05] noise-overlay" />

      {/* top fade so header stays readable */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950/80 to-transparent" />
    </div>
  )
}