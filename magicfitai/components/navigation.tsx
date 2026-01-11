"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Liquid Glass Navigation Bar */}
        <div className="glass rounded-[20px] px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-lg font-medium tracking-tight text-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                <span className="text-sm font-semibold text-primary">M</span>
              </div>
              <span>MAGIC FIT</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/"
                className={`rounded-[14px] px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  pathname === "/"
                    ? "bg-white/50 text-foreground dark:bg-white/10"
                    : "text-foreground/60 hover:bg-white/30 hover:text-foreground dark:hover:bg-white/10"
                }`}
              >
                Főoldal
              </Link>
              <Link
                href="/ai-sminkajanlo"
                className={`rounded-[14px] px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                  pathname === "/ai-sminkajanlo"
                    ? "bg-white/50 text-foreground dark:bg-white/10"
                    : "text-foreground/60 hover:bg-white/30 hover:text-foreground dark:hover:bg-white/10"
                }`}
              >
                AI Konzultáció
              </Link>
              {session && (
                <Link
                  href="/eredmenyeim"
                  className={`rounded-[14px] px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 ${
                    pathname === "/eredmenyeim" || pathname.startsWith("/eredmenyeim/")
                      ? "bg-white/50 text-foreground dark:bg-white/10"
                      : "text-foreground/60 hover:bg-white/30 hover:text-foreground dark:hover:bg-white/10"
                  }`}
                >
                  Eredményeim
                </Link>
              )}

              {session ? (
                <div className="ml-3 flex items-center gap-2">
                  <Link
                    href="/profil"
                    className="flex items-center gap-2 rounded-[12px] bg-white/20 px-3 py-1.5 transition-all duration-300 hover:bg-white/30"
                  >
                    <User className="h-4 w-4 text-foreground/70" />
                    <span className="text-sm text-foreground/70">{session.user?.name || session.user?.email?.split('@')[0]}</span>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-[12px] px-3"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="ml-3 flex items-center gap-2">
                   <Button size="sm" variant="ghost" asChild>
                    <Link href="/regisztracio">Regisztracio</Link>
                  </Button>
                  <Button size="sm" className="rounded-[12px] px-5" asChild>
                    <Link href="/bejelentkezes">Bejelentkezes</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-[14px] p-2.5 text-foreground transition-all duration-300 hover:bg-white/40 md:hidden"
              aria-label="Menü megnyitása"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="border-t border-white/20 py-4 md:hidden">
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="rounded-[14px] px-4 py-3.5 text-sm font-medium tracking-wide text-foreground/70 transition-all duration-300 hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
                >
                  Főoldal
                </Link>
                <Link
                  href="/ai-sminkajanlo"
                  onClick={() => setIsOpen(false)}
                  className="rounded-[14px] px-4 py-3.5 text-sm font-medium tracking-wide text-foreground/70 transition-all duration-300 hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
                >
                  AI Konzultáció
                </Link>
                {session && (
                  <Link
                    href="/eredmenyeim"
                    onClick={() => setIsOpen(false)}
                    className="rounded-[14px] px-4 py-3.5 text-sm font-medium tracking-wide text-foreground/70 transition-all duration-300 hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
                  >
                    Eredményeim
                  </Link>
                )}
                <Link
                  href="#szolgaltatasok"
                  onClick={() => setIsOpen(false)}
                  className="rounded-[14px] px-4 py-3.5 text-sm font-medium tracking-wide text-foreground/70 transition-all duration-300 hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
                >
                  Szolgáltatások
                </Link>

                {session ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <Link
                      href="/profil"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-[12px] bg-white/20 px-4 py-3 transition-all duration-300 hover:bg-white/30"
                    >
                      <User className="h-4 w-4 text-foreground/70" />
                      <span className="text-sm text-foreground/70">{session.user?.name || session.user?.email?.split('@')[0]}</span>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-[12px]"
                      onClick={() => {
                        setIsOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Kijelentkezés
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="w-full rounded-[12px]" asChild>
                      <Link href="/bejelentkezes" onClick={() => setIsOpen(false)}>
                        Bejelentkezés
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full rounded-[12px]" asChild>
                      <Link href="/ai-sminkajanlo" onClick={() => setIsOpen(false)}>
                        Konzultáció kérése
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
