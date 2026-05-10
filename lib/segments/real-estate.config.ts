import type { UniversalSegmentConfig } from "@/lib/core"

export const realEstateSegmentConfig: UniversalSegmentConfig = {
  id: "real_estate",
  name: "Imobiliaria",
  objective: "Converter visitantes em leads qualificados, contatos com corretor e visitas agendadas.",
  primaryCTA: {
    label: "Agendar visita",
    action: "real_estate.visits.open",
    variant: "primary",
  },
  contentPriorities: ["video", "review", "news", "social"],
  requiredModules: [
    "real_estate.properties",
    "real_estate.lead",
    "real_estate.visits",
  ],
  operationalFlow: [
    { id: "browse-properties", label: "Explorar imoveis", moduleId: "real_estate.properties", action: "real_estate.properties.browse" },
    { id: "view-property", label: "Ver detalhes do imovel", moduleId: "real_estate.properties", action: "real_estate.property.view" },
    { id: "capture-lead", label: "Capturar interesse", moduleId: "real_estate.lead", action: "real_estate.lead.capture" },
    { id: "schedule-visit", label: "Agendar visita", moduleId: "real_estate.visits", action: "real_estate.visit.schedule" },
  ],
  rules: {
    supportsSale: true,
    supportsRent: true,
    requiresLeadCapture: true,
    supportsVisitScheduling: true,
  },
}
