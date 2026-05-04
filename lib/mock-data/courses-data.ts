import type { Course, Instructor, BusinessConfig } from "@/lib/business-types"

export const coursesConfig: BusinessConfig = {
  model: "courses",
  name: "Escola Digital Pro",
  logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop",
  description: "Aprenda as habilidades do futuro",
  primaryColor: "#6366F1",
  instagram: "@escoladigitalpro"
}

export const instructors: Instructor[] = [
  {
    id: "inst-1",
    name: "Lucas Martins",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    title: "Desenvolvedor Senior & Educador",
    bio: "10+ anos de experiencia em desenvolvimento web. Ja formei mais de 15.000 alunos em programacao.",
    rating: 4.9,
    studentsCount: 15420,
    coursesCount: 8
  },
  {
    id: "inst-2",
    name: "Ana Carolina",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    title: "Designer UX/UI & Mentora",
    bio: "Designer com passagem por empresas como Google e Nubank. Especialista em Design Thinking.",
    rating: 4.8,
    studentsCount: 8930,
    coursesCount: 5
  }
]

export const courses: Course[] = [
  {
    id: "course-1",
    title: "Desenvolvimento Web Completo 2024",
    description: "Do zero ao profissional: HTML, CSS, JavaScript, React, Node.js e muito mais",
    instructor: instructors[0],
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
    previewVideo: "https://example.com/preview.mp4",
    price: 297,
    originalPrice: 497,
    rating: 4.9,
    reviewCount: 3247,
    studentsCount: 12450,
    duration: "45h 30min",
    lessons: 285,
    level: "beginner",
    category: "Programacao",
    tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    certificate: true,
    lifetime: true,
    features: [
      "45+ horas de video aulas",
      "285 aulas em 15 modulos",
      "Projetos praticos reais",
      "Certificado de conclusao",
      "Acesso vitalicio",
      "Suporte direto com instrutor",
      "Comunidade exclusiva no Discord"
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Introducao ao Desenvolvimento Web",
        duration: "2h 30min",
        lessons: [
          { id: "l1", title: "Bem-vindo ao curso", duration: "5min", type: "video", preview: true },
          { id: "l2", title: "Como funciona a internet", duration: "15min", type: "video", preview: true },
          { id: "l3", title: "Configurando o ambiente", duration: "20min", type: "video", preview: false },
          { id: "l4", title: "Quiz: Conceitos basicos", duration: "10min", type: "quiz", preview: false }
        ]
      },
      {
        id: "mod-2",
        title: "HTML5 na Pratica",
        duration: "4h 15min",
        lessons: [
          { id: "l5", title: "Estrutura de um documento HTML", duration: "18min", type: "video", preview: false },
          { id: "l6", title: "Tags semanticas", duration: "22min", type: "video", preview: false },
          { id: "l7", title: "Formularios e validacao", duration: "35min", type: "video", preview: false },
          { id: "l8", title: "Projeto: Landing Page", duration: "1h", type: "exercise", preview: false }
        ]
      },
      {
        id: "mod-3",
        title: "CSS Moderno",
        duration: "6h 45min",
        lessons: [
          { id: "l9", title: "Flexbox do zero", duration: "45min", type: "video", preview: true },
          { id: "l10", title: "CSS Grid Layout", duration: "50min", type: "video", preview: false },
          { id: "l11", title: "Animacoes e transicoes", duration: "30min", type: "video", preview: false }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "UX/UI Design do Zero ao Avancado",
    description: "Aprenda a criar interfaces incriveis usando Figma, Design Thinking e principios de UX",
    instructor: instructors[1],
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    price: 247,
    originalPrice: 397,
    rating: 4.8,
    reviewCount: 1892,
    studentsCount: 6780,
    duration: "32h 15min",
    lessons: 180,
    level: "beginner",
    category: "Design",
    tags: ["Figma", "UX", "UI", "Design Thinking", "Prototipacao"],
    certificate: true,
    lifetime: true,
    features: [
      "32+ horas de conteudo",
      "180 aulas praticas",
      "10 projetos de portfolio",
      "Certificado reconhecido",
      "Acesso vitalicio",
      "Mentoria em grupo mensal"
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Fundamentos do Design",
        duration: "3h",
        lessons: [
          { id: "l1", title: "O que e UX Design", duration: "12min", type: "video", preview: true },
          { id: "l2", title: "Principios de Design Visual", duration: "25min", type: "video", preview: true }
        ]
      }
    ]
  },
  {
    id: "course-3",
    title: "Marketing Digital e Trafego Pago",
    description: "Domine Google Ads, Facebook Ads e estrategias de conversao",
    instructor: instructors[0],
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    price: 197,
    rating: 4.7,
    reviewCount: 956,
    studentsCount: 4230,
    duration: "18h",
    lessons: 95,
    level: "intermediate",
    category: "Marketing",
    tags: ["Google Ads", "Facebook Ads", "Trafego", "Conversao"],
    certificate: true,
    lifetime: true,
    features: [
      "18 horas de conteudo",
      "Projetos com orcamento real",
      "Templates de campanhas",
      "Suporte por 12 meses"
    ],
    curriculum: []
  }
]

// Categorias de cursos
export const coursesCategories = [
  { id: "programacao", name: "Programacao", count: 25 },
  { id: "design", name: "Design", count: 18 },
  { id: "marketing", name: "Marketing", count: 12 },
  { id: "negocios", name: "Negocios", count: 15 },
  { id: "dados", name: "Data Science", count: 8 }
]
