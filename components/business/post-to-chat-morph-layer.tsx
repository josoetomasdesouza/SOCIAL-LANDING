/* eslint-disable @next/next/no-img-element */
"use client"

import { X } from "lucide-react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  conversationContextChipMediaClassName,
  conversationContextChipRemoveButtonClassName,
  conversationContextChipRemovablePaddingClassName,
  conversationContextChipShellClassName,
  conversationContextChipSubtitleClassName,
  conversationContextChipTextClassName,
  conversationContextChipTitleClassName,
} from "@/components/business/conversation-context-chip-styles"

export interface PostToChatMorphRect {
  left: number
  top: number
  width: number
  height: number
  borderRadius: number
}

export interface PostToChatMorphPreview {
  id: string
  title: string
  subtitle?: string
  image: string
}

interface PostToChatMorphLayerProps {
  animationKey: number
  preview: PostToChatMorphPreview
  fromRect: PostToChatMorphRect
  toRect: PostToChatMorphRect
  durationMs?: number
  onComplete: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

export function PostToChatMorphLayer({
  animationKey,
  preview,
  fromRect,
  toRect,
  durationMs = 480,
  onComplete,
}: PostToChatMorphLayerProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = nodeRef.current

    if (!node) {
      onComplete()
      return
    }

    let rafId = 0
    let startTime = 0
    let completed = false
    let listenersAttached = false

    const detachListeners = () => {
      if (!listenersAttached) return

      window.removeEventListener("scroll", cancelAnimation, true)
      window.removeEventListener("resize", cancelAnimation)
      listenersAttached = false
    }

    const finish = () => {
      if (completed) return
      completed = true
      onComplete()
    }

    const applyFrame = (rawProgress: number) => {
      const easedProgress = easeOutCubic(rawProgress)
      const translateX = lerp(0, toRect.left - fromRect.left, easedProgress)
      const translateY = lerp(0, toRect.top - fromRect.top, easedProgress)
      const scaleX = lerp(1, toRect.width / fromRect.width, easedProgress)
      const scaleY = lerp(1, toRect.height / fromRect.height, easedProgress)
      const opacity = lerp(0.9, 1, clamp(rawProgress * 1.35, 0, 1))

      node.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`
      node.style.opacity = String(opacity)
    }

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
      }

      const progress = clamp((timestamp - startTime) / durationMs, 0, 1)
      applyFrame(progress)

      if (progress >= 1) {
        finish()
        return
      }

      rafId = window.requestAnimationFrame(step)
    }

    const cancelAnimation = () => {
      window.cancelAnimationFrame(rafId)
      detachListeners()
      finish()
    }

    applyFrame(0)
    rafId = window.requestAnimationFrame(step)
    window.addEventListener("scroll", cancelAnimation, { passive: true, capture: true })
    window.addEventListener("resize", cancelAnimation, { passive: true })
    listenersAttached = true

    return () => {
      window.cancelAnimationFrame(rafId)
      detachListeners()
      finish()
    }
  }, [animationKey, durationMs, fromRect.borderRadius, fromRect.height, fromRect.left, fromRect.top, fromRect.width, onComplete, toRect.borderRadius, toRect.height, toRect.left, toRect.top, toRect.width])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <div
        ref={nodeRef}
        className={cn(
          conversationContextChipShellClassName,
          conversationContextChipRemovablePaddingClassName,
          "absolute left-0 top-0 origin-top-left overflow-hidden will-change-transform"
        )}
        style={{
          left: fromRect.left,
          top: fromRect.top,
          width: fromRect.width,
          height: fromRect.height,
          borderRadius: fromRect.borderRadius,
          backfaceVisibility: "hidden",
        }}
      >
        <div className={conversationContextChipMediaClassName}>
            <img
              alt=""
              src={preview.image}
              decoding="async"
              draggable={false}
              loading="eager"
              className="h-full w-full select-none object-cover"
            />
          </div>
          <div className={conversationContextChipTextClassName}>
            {preview.subtitle ? (
              <p className={conversationContextChipSubtitleClassName}>
                {preview.subtitle}
              </p>
            ) : null}
            <p className={conversationContextChipTitleClassName}>{preview.title}</p>
          </div>
          <div aria-hidden="true" className={conversationContextChipRemoveButtonClassName}>
            <X className="h-3.5 w-3.5" />
          </div>
        </div>
    </div>
  )
}
