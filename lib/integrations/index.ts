/**
 * Integration ports — adapter isolation layer.
 * Real providers are NOT wired. Use mock adapters in dev/tests.
 */

export * as instagram from "./instagram/port"
export { instagramAdapter } from "./instagram/adapter"
export { instagramMockAdapter } from "./instagram/mock"
export type * from "./instagram/types"

export * as whatsapp from "./whatsapp/port"
export { whatsappAdapter } from "./whatsapp/adapter"
export { whatsappMockAdapter } from "./whatsapp/mock"
export type * from "./whatsapp/types"

export * as youtube from "./youtube/port"
export { youtubeAdapter } from "./youtube/adapter"
export { youtubeMockAdapter } from "./youtube/mock"
export type * from "./youtube/types"

export * as google from "./google/port"
export { googleAdapter } from "./google/adapter"
export { googleMockAdapter } from "./google/mock"
export type * from "./google/types"

export * as shopify from "./shopify/port"
export { shopifyAdapter } from "./shopify/adapter"
export { shopifyMockAdapter } from "./shopify/mock"
export type * from "./shopify/types"

export * as crm from "./crm/port"
export { crmAdapter } from "./crm/adapter"
export { crmMockAdapter } from "./crm/mock"
export type * from "./crm/types"

export const INTEGRATION_PROVIDERS = [
  "instagram",
  "whatsapp",
  "youtube",
  "google",
  "shopify",
  "crm",
] as const

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number]

export function isIntegrationProvider(value: string): value is IntegrationProvider {
  return (INTEGRATION_PROVIDERS as readonly string[]).includes(value)
}
