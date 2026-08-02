
/** Layout placeholder while carousel wallpapers load — keeps #features stable on refresh. */
export default function BrowseCarouselFeatureRowFallback() {
  return (
    <section className="marketing-section" aria-hidden>
      <div
        className="marketing-container grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-14"
      >
        <div className="order-2 lg:order-none lg:col-start-2">
          <div className="w-full lg:max-w-[360px]">
            <div className="h-9 w-4/5 max-w-sm rounded-md bg-foreground/5" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-foreground/5" />
              <div className="h-4 w-11/12 rounded bg-foreground/5" />
              <div className="h-4 w-3/4 rounded bg-foreground/5" />
            </div>
          </div>
        </div>
        <div className="order-1 min-w-0 lg:order-none lg:col-start-1 lg:row-start-1">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-foreground/5" />
        </div>
      </div>
    </section>
  )
}
