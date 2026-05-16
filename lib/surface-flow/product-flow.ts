import type {
  ProductFlowContext,
  ProductFlowRequest,
  ProductFlowResult,
} from "./contracts"

function hasResolvedRequiredVariants(
  requiredVariantIds: string[] = [],
  selectedVariants: Record<string, string> = {}
) {
  return requiredVariantIds.every((variantId) => Boolean(selectedVariants[variantId]))
}

export function planProductFlow(
  request: ProductFlowRequest,
  context: ProductFlowContext
): ProductFlowResult {
  switch (request.action) {
    case "open_detail":
      if (!request.productId) {
        return {
          type: "noop",
          reason: "missing_product_id",
        }
      }

      return {
        type: "open_detail",
        productId: request.productId,
        reason: "view_detail",
      }

    case "add_to_cart": {
      if (!request.productId) {
        return {
          type: "noop",
          reason: "missing_product_id",
        }
      }

      if (
        context.hasVariants &&
        !hasResolvedRequiredVariants(context.requiredVariantIds, request.selectedVariants)
      ) {
        return {
          type: "open_detail",
          productId: request.productId,
          reason: "requires_variant_selection",
        }
      }

      return {
        type: "add_to_cart",
        productId: request.productId,
        quantity: request.quantity ?? 1,
        selectedVariants: request.selectedVariants,
        openCartAfterAdd: request.openCartAfterAdd ?? true,
      }
    }

    case "start_checkout":
      return {
        type: "start_checkout",
      }

    default:
      return {
        type: "noop",
        reason: "unsupported_action",
      }
  }
}
