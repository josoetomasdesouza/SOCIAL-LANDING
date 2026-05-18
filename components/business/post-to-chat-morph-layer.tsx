/* eslint-disable @next/next/no-img-element */
"use client"

import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
  showDismiss?: boolean
}

interface PostToChatMorphLayerProps {
  animationKey: number
  preview: PostToChatMorphPreview
  fromRect: PostToChatMorphRect
  toRect: PostToChatMorphRect
  targetContextId?: string
  resolveToRect?: () => PostToChatMorphRect | null
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
  targetContextId,
  resolveToRect,
  durationMs = 480,
  onComplete,
}: PostToChatMorphLayerProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const resolveToRectRef = useRef(resolveToRect)
  const [clonedChipHtml, setClonedChipHtml] = useState<string | null>(null)

  useEffect(() => {
    resolveToRectRef.current = resolveToRect
  }, [resolveToRect])

  useEffect(() => {
    if (!targetContextId || typeof document === "undefined") {
      setClonedChipHtml(null)
      return
    }

    const escapedContextId =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(targetContextId)
        : targetContextId.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    const chipElement = document.querySelector<HTMLElement>(`[data-conversation-context-chip="${escapedContextId}"]`)

    if (!chipElement) {
      setClonedChipHtml(null)
      return
    }

    const clone = chipElement.cloneNode(true) as HTMLElement
    clone.removeAttribute("aria-hidden")
    clone.classList.remove("pointer-events-none", "opacity-0")
    clone.style.width = "100%"
    clone.style.height = "100%"
    clone.style.minWidth = "0"
    clone.style.boxSizing = "border-box"
    setClonedChipHtml(clone.outerHTML)
  }, [targetContextId])

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
      const liveToRect = resolveToRectRef.current?.() ?? toRect
      const translateX = lerp(0, liveToRect.left - fromRect.left, easedProgress)
      const translateY = lerp(0, liveToRect.top - fromRect.top, easedProgress)
      const scaleX = lerp(1, liveToRect.width / fromRect.width, easedProgress)
      const scaleY = lerp(1, liveToRect.height / fromRect.height, easedProgress)
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
        className={
          clonedChipHtml
            ? "absolute left-0 top-0 origin-top-left will-change-transform"
            : "absolute left-0 top-0 origin-top-left flex items-center gap-2 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.055] pr-1.5 shadow-[0_10px_24px_-20px_rgba(2,6,23,0.6)] will-change-transform"
        }
        style={{
          left: fromRect.left,
          top: fromRect.top,
          width: fromRect.width,
          height: fromRect.height,
          borderRadius: fromRect.borderRadius,
          backfaceVisibility: "hidden",
        }}
      >
        {clonedChipHtml ? (
          <div
            className="h-full w-full"
            dangerouslySetInnerHTML={{ __html: clonedChipHtml }}
          />
        ) : (
          <>
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
              <img
                alt=""
                src={preview.image}
                decoding="async"
                draggable={false}
                loading="eager"
                className="h-full w-full select-none object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              {preview.subtitle ? (
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-white/42">
                  {preview.subtitle}
                </p>
              ) : null}
              <p className="truncate text-xs font-medium text-white/92">{preview.title}</p>
            </div>
            {preview.showDismiss !== false ? (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/56">
                <X className="h-3.5 w-3.5" />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
