import { SocialLanding } from "@/components/social-landing"
import { mockBrand, mockPosts, mockCategories } from "@/lib/mock-data"
import Link from "next/link"

export default function Home() {
  return (
    <>
      {/* Demo Link - Fixed Button */}
      <Link 
        href="/demo"
        className="fixed bottom-6 left-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform"
      >
        Ver todos os modelos
      </Link>
      
      <SocialLanding 
        brand={mockBrand}
        posts={mockPosts}
        categories={mockCategories}
      />
    </>
  )
}
