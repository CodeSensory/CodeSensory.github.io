export function SwissBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="swiss-blueprint pointer-events-none fixed inset-0 z-0"
      />
      <div aria-hidden className="swiss-noise pointer-events-none fixed inset-0 z-[1]" />
    </>
  )
}
