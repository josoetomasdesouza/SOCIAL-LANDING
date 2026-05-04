"use client"

import { Search } from "lucide-react"

export function SearchBar() {
  return (
    <section className="py-5 bg-background">
      <div className="px-4 sm:px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="O que voce quer encontrar?"
            className="w-full pl-12 pr-5 py-3.5 bg-secondary/70 hover:bg-secondary rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-secondary transition-all duration-200 shadow-sm"
          />
        </div>
      </div>
    </section>
  )
}
