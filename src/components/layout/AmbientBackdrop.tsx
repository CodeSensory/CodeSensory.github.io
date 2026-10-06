export function AmbientBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-teal-600/[0.07] blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-zinc-500/[0.08] blur-3xl" />
      </div>
      <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 z-[1]" />
    </>
  )
}
