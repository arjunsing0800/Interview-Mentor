/** Elegant placeholder shown while the 3D scene chunk loads. */
export function SceneFallback() {
  return (
    <div className="flex aspect-square w-full items-center justify-center">
      <div className="relative">
        <div className="animate-pulse-orb h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(79,124,255,0.5),_rgba(99,102,241,0.12)_60%,_transparent)] blur-sm" />
        <div className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-electric/20" />
      </div>
    </div>
  )
}

export default SceneFallback