"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Clock, Users, Star, Award, ChevronRight, BookOpen, GraduationCap, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BusinessSocialLanding, type BusinessSection } from "../business-social-landing"
import { ActionDrawer } from "../action-drawer"
import { CourseCheckout } from "../checkout-flows"
import { coursesConfig, courses } from "@/lib/mock-data/courses-data"
import { coursesContent } from "@/lib/mock-data/business-content"
import type { Course } from "@/lib/business-types"
import type { UniversalSegmentConfig } from "@/lib/core"
import { coursesSegmentConfig } from "@/lib/segments/courses.config"

type CourseTrack = {
  id: string
  name: string
  icon: string
  courses: number
}

const courseTracks: CourseTrack[] = [
  { id: "1", name: "Programacao", icon: "💻", courses: 12 },
  { id: "2", name: "Design", icon: "🎨", courses: 8 },
  { id: "3", name: "Marketing", icon: "📈", courses: 6 },
  { id: "4", name: "Negocios", icon: "💼", courses: 5 },
]

// ========================================
// MODULO: CURSOS EM DESTAQUE (OBJETIVO PRINCIPAL)
// ========================================
function CoursesModule({
  items,
  onSelectCourse
}: {
  items: Course[]
  onSelectCourse: (course: Course) => void
}) {
  const featuredCourses = items.slice(0, 3)

  return (
    <div className="space-y-4">
      {featuredCourses.map((course) => {
        const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0
        return (
          <button
            key={course.id}
            onClick={() => onSelectCourse(course)}
            className="w-full text-left bg-card rounded-xl overflow-hidden border border-border/50 hover:border-accent/50 transition-colors"
          >
            <div className="relative aspect-video">
              <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-foreground ml-1" />
                </div>
              </div>
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">-{discount}%</Badge>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={course.instructor.avatar} alt={course.instructor.name} fill className="object-cover" />
                </div>
                <span className="text-sm text-muted-foreground">{course.instructor.name}</span>
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2">{course.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {(course.studentsCount / 1000).toFixed(1)}k
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-lg font-bold text-accent">R$ {course.price.toFixed(2).replace(".", ",")}</span>
                {course.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">R$ {course.originalPrice.toFixed(2).replace(".", ",")}</span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ========================================
// MODULO: TRILHAS DE APRENDIZADO
// ========================================
function TracksModule({ tracks }: { tracks: CourseTrack[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tracks.map((track) => (
        <button key={track.id} className="p-4 bg-secondary/50 hover:bg-secondary rounded-xl text-left transition-colors">
          <span className="text-2xl">{track.icon}</span>
          <p className="font-medium text-foreground mt-2">{track.name}</p>
          <p className="text-sm text-muted-foreground">{track.courses} cursos</p>
        </button>
      ))}
    </div>
  )
}

// ========================================
// DRAWER: DETALHES DO CURSO
// ========================================
function CourseDetailDrawer({ 
  course, 
  isOpen, 
  onClose,
  onEnroll
}: { 
  course: Course | null
  isOpen: boolean
  onClose: () => void
  onEnroll: () => void
}) {
  if (!course) return null
  
  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0
  
  return (
    <ActionDrawer isOpen={isOpen} onClose={onClose} title={course.title} size="lg">
      <div className="space-y-6">
        {/* Video Preview */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
          <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-foreground ml-1" />
            </div>
          </div>
        </div>
        
        {/* Instrutor */}
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image src={course.instructor.avatar} alt={course.instructor.name} fill className="object-cover" />
          </div>
          <div>
            <p className="font-medium">{course.instructor.name}</p>
            <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Star className="w-5 h-5 mx-auto text-yellow-400" />
            <p className="font-bold mt-1">{course.rating}</p>
            <p className="text-xs text-muted-foreground">Avaliacao</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Users className="w-5 h-5 mx-auto text-accent" />
            <p className="font-bold mt-1">{(course.studentsCount / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Alunos</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-xl">
            <Clock className="w-5 h-5 mx-auto text-accent" />
            <p className="font-bold mt-1">{course.duration}</p>
            <p className="text-xs text-muted-foreground">Duracao</p>
          </div>
        </div>
        
        {/* Descricao */}
        <div>
          <h4 className="font-medium mb-2">Sobre o curso</h4>
          <p className="text-muted-foreground text-sm">{course.description}</p>
        </div>
        
        {/* Features */}
        {course.features && (
          <div>
            <h4 className="font-medium mb-2">O que voce vai aprender</h4>
            <ul className="space-y-2">
              {course.features.slice(0, 4).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Preco e CTA */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-accent">R$ {course.price.toFixed(2).replace(".", ",")}</span>
            {course.originalPrice && (
              <>
                <span className="text-muted-foreground line-through">R$ {course.originalPrice.toFixed(2).replace(".", ",")}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {discount}% OFF
                </Badge>
              </>
            )}
          </div>
          <Button className="w-full h-12" onClick={onEnroll}>
            <GraduationCap className="w-5 h-5 mr-2" />
            Matricular agora
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Garantia de 7 dias ou seu dinheiro de volta
          </p>
        </div>
      </div>
    </ActionDrawer>
  )
}

type CoursesSectionData = {
  content: typeof coursesContent
  courses: Course[]
  tracks: CourseTrack[]
}

type CoursesSectionHandlers = {
  onSelectCourse: (course: Course) => void
}

function buildCoursesSections({
  segmentConfig,
  data,
  handlers,
}: {
  segmentConfig: UniversalSegmentConfig
  data: CoursesSectionData
  handlers: CoursesSectionHandlers
}): BusinessSection[] {
  const sections: BusinessSection[] = []
  const contentPriorities = new Set(segmentConfig.contentPriorities)

  if (segmentConfig.requiredModules.includes("courses.enrollment")) {
    sections.push({
      id: "courses",
      title: "Cursos em Destaque",
      icon: <GraduationCap className="w-5 h-5 text-accent" />,
      type: "primary-action",
      customContent: <CoursesModule items={data.courses} onSelectCourse={handlers.onSelectCourse} />
    })
  }

  if (segmentConfig.requiredModules.includes("courses.modules")) {
    sections.push({
      id: "tracks",
      title: "Trilhas de Aprendizado",
      icon: <BookOpen className="w-5 h-5 text-accent" />,
      type: "specific",
      customContent: <TracksModule tracks={data.tracks} />
    })
  }

  if (contentPriorities.has("video")) {
    sections.push({
      id: "videos",
      title: "Aulas Gratuitas",
      icon: <Play className="w-5 h-5 text-accent" />,
      type: "content",
      posts: data.content.videos
    })
  }

  if (contentPriorities.has("review")) {
    sections.push({
      id: "reviews",
      title: "Depoimentos de Alunos",
      icon: <Star className="w-5 h-5 text-accent" />,
      type: "content",
      posts: data.content.reviews
    })
  }

  if (contentPriorities.has("news")) {
    sections.push({
      id: "news",
      title: "Na Midia",
      icon: <Newspaper className="w-5 h-5 text-accent" />,
      type: "content",
      posts: data.content.news
    })
  }

  if (contentPriorities.has("social")) {
    sections.push({
      id: "social",
      title: "Comunidade",
      type: "content",
      posts: data.content.social
    })
  }

  return sections
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export function CoursesFeed() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    setCourseDrawerOpen(true)
  }

  const sections = buildCoursesSections({
    segmentConfig: coursesSegmentConfig,
    data: {
      content: coursesContent,
      courses,
      tracks: courseTracks,
    },
    handlers: {
      onSelectCourse: handleSelectCourse,
    },
  })
  
  return (
    <>
      <BusinessSocialLanding
        config={coursesConfig}
        stories={coursesContent.stories}
        sections={sections}
        onStoryClick={(story) => {
          if (story.isMain && courses[0]) {
            handleSelectCourse(courses[0])
          }
        }}
        footerLinks={[
          { label: "Sobre", href: "#" },
          { label: "Cursos", href: "#" },
          { label: "Contato", href: "#" },
        ]}
      />
      
      <CourseDetailDrawer
        course={selectedCourse}
        isOpen={courseDrawerOpen}
        onClose={() => setCourseDrawerOpen(false)}
        onEnroll={() => {
          setCourseDrawerOpen(false)
          setCheckoutOpen(true)
        }}
      />
      
      <ActionDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Finalizar Matricula"
        size="lg"
      >
        {selectedCourse && (
          <CourseCheckout
            courseName={selectedCourse.title}
            courseThumbnail={selectedCourse.thumbnail}
            instructorName={selectedCourse.instructor.name}
            price={selectedCourse.price}
            onComplete={() => {
              setCheckoutOpen(false)
              setSelectedCourse(null)
            }}
            onBack={() => {
              setCheckoutOpen(false)
              setCourseDrawerOpen(true)
            }}
          />
        )}
      </ActionDrawer>
    </>
  )
}
