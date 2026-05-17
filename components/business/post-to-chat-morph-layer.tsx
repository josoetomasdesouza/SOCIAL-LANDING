/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef } from "react"

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
  const sourceLayerRef = useRef<HTMLDivElement>(null)
  const chipLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = nodeRef.current
    const sourceLayer = sourceLayerRef.current
    const chipLayer = chipLayerRef.current

    if (!node || !sourceLayer || !chipLayer) {
      onComplete()
      return
    }

    let rafId = 0
    let startTime = 0
    let completed = false

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
      const borderRadius = lerp(fromRect.borderRadius, toRect.borderRadius, easedProgress)
      const sourceOpacity = clamp(1 - rawProgress * 2.1, 0, 1)
      const chipOpacity = clamp((rawProgress - 0.18) * 2.6, 0, 1)

      node.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`
      node.style.borderRadius = `${borderRadius}px`
      node.style.boxShadow =
        rawProgress < 0.55
          ? "0 30px 60px -30px rgba(15, 23, 42, 0.42)"
          : "0 18px 34px -24px rgba(15, 23, 42, 0.3)"
      node.style.opacity = String(lerp(1, 0.96, rawProgress))
      sourceLayer.style.opacity = String(sourceOpacity)
      chipLayer.style.opacity = String(chipOpacity)
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
      finish()
    }

    applyFrame(0)
    rafId = window.requestAnimationFrame(step)
    window.addEventListener("scroll", cancelAnimation, { passive: true, capture: true })
    window.addEventListener("resize", cancelAnimation, { passive: true })

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", cancelAnimation, true)
      window.removeEventListener("resize", cancelAnimation)
    }
  }, [animationKey, durationMs, fromRect.borderRadius, fromRect.height, fromRect.left, fromRect.top, fromRect.width, onComplete, toRect.borderRadius, toRect.height, toRect.left, toRect.top, toRect.width])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <div
        ref={nodeRef}
        className="absolute left-0 top-0 origin-top-left overflow-hidden border border-border/60 bg-background/96 will-change-transform"
        style={{
          left: fromRect.left,
          top: fromRect.top,
          width: fromRect.width,
          height: fromRect.height,
          borderRadius: fromRect.borderRadius,
          backfaceVisibility: "hidden",
        }}
      >
        <div ref={sourceLayerRef} className="absolute inset-0">
          <img
            alt=""
            src={preview.image}
            decoding="async"
            draggable={false}
            loading="eager"
            className="h-full w-full select-none object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/18 to-black/6" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            {preview.subtitle ? (
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/82">
                {preview.subtitle}
              </p>
            ) : null}
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{preview.title}</p>
          </div>
        </div>

        <div
          ref={chipLayerRef}
          className="absolute inset-0 flex items-center gap-2.5 rounded-[inherit] bg-background/96 px-2.5 text-foreground"
          style={{ opacity: 0 }}
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border/50 bg-secondary/60">
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
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {preview.subtitle}
              </p>
            ) : null}
            <p className="truncate text-xs font-medium text-foreground">{preview.title}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
