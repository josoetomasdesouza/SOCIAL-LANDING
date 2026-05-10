import type { UniversalSegmentConfig } from "@/lib/core"

export const coursesSegmentConfig: UniversalSegmentConfig = {
  id: "courses",
  name: "Cursos",
  objective: "Converter visitantes em matriculas a partir de trilhas, aulas e prova de valor educacional.",
  primaryCTA: {
    label: "Matricular-se",
    action: "courses.enrollment.open",
    variant: "primary",
  },
  contentPriorities: ["video", "review", "news", "social"],
  requiredModules: [
    "courses.lessons",
    "courses.modules",
    "courses.enrollment",
  ],
  operationalFlow: [
    { id: "discover-course", label: "Conhecer curso", moduleId: "courses.modules", action: "courses.course.view" },
    { id: "preview-lessons", label: "Assistir preview", moduleId: "courses.lessons", action: "courses.lesson.preview" },
    { id: "review-curriculum", label: "Ver curriculo", moduleId: "courses.modules", action: "courses.curriculum.view" },
    { id: "enroll", label: "Concluir matricula", moduleId: "courses.enrollment", action: "courses.enrollment.start" },
  ],
  rules: {
    supportsPreviewLessons: true,
    supportsCertificate: true,
    requiresEnrollment: true,
    allowsLifetimeAccess: true,
  },
}
