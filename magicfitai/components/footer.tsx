export function Footer() {
  return (
    <footer id="kapcsolat" className="relative overflow-hidden border-t border-border/50 bg-secondary/30 px-4 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                <span className="text-sm font-semibold text-primary">M</span>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-foreground">MAGIC FIT</h3>
            </div>
            <p className="text-sm tracking-wide text-muted-foreground">
              Személyre szabott szépségkonzultáció
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-8 text-sm">
            <a
              href="#"
              className="tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              Impresszum
            </a>
            <a
              href="#"
              className="tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              Adatvédelem
            </a>
            <a
              href="#kapcsolat"
              className="tracking-wide text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              Kapcsolat
            </a>
          </nav>
        </div>

        <div className="divider-elegant mt-12 mb-8" />

        <div className="text-center text-sm tracking-wide text-muted-foreground/70">
          <p>2025 MAGIC FIT. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  )
}
