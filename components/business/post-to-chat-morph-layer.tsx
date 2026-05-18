"use client"

import { useEffect, useRef } from "react"
import { ConversationContextChipVisual } from "@/components/business/conversation-context-chip-visual"
import { getConversationContextChipRect } from "@/components/business/conversation-context-chip-dom"

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
  const fromRectRef = useRef(fromRect)
  const toRectRef = useRef(toRect)

  useEffect(() => {
    fromRectRef.current = fromRect
  }, [fromRect])

  useEffect(() => {
    toRectRef.current = toRect
  }, [toRect])

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
      const currentFromRect = fromRectRef.current
      const currentToRect = getConversationContextChipRect(preview.id) ?? toRectRef.current
      const easedProgress = easeOutCubic(rawProgress)
      const translateX = lerp(currentFromRect.left - currentToRect.left, 0, easedProgress)
      const translateY = lerp(currentFromRect.top - currentToRect.top, 0, easedProgress)
      const scaleX = lerp(currentFromRect.width / currentToRect.width, 1, easedProgress)
      const scaleY = lerp(currentFromRect.height / currentToRect.height, 1, easedProgress)
      const opacity = lerp(0.9, 1, clamp(rawProgress * 1.35, 0, 1))

      node.style.left = `${currentToRect.left}px`
      node.style.top = `${currentToRect.top}px`
      node.style.width = `${currentToRect.width}px`
      node.style.height = `${currentToRect.height}px`
      node.style.borderRadius = `${currentToRect.borderRadius}px`
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
  }, [animationKey, durationMs, onComplete, preview.id])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <ConversationContextChipVisual
        ref={nodeRef}
        item={preview}
        removeMode="decorative"
        className="absolute left-0 top-0 origin-top-left overflow-hidden will-change-transform"
        style={{
          left: toRect.left,
          top: toRect.top,
          width: toRect.width,
          height: toRect.height,
          borderRadius: toRect.borderRadius,
          backfaceVisibility: "hidden",
          transform: `translate3d(${fromRect.left - toRect.left}px, ${fromRect.top - toRect.top}px, 0) scale(${fromRect.width / toRect.width}, ${fromRect.height / toRect.height})`,
          opacity: 0.9,
        }}
      />
    </div>
  )
}
