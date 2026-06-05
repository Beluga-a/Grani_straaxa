'use client'
import { useEffect } from 'react'

export default function SmoothScroll() {
  useEffect(() => {
    let target = window.scrollY
    let current = window.scrollY
    let wheelActive = false
    let raf: number

    const onWheel = (e: WheelEvent) => {
      // Don't intercept scrollable sub-elements (dropdowns, textareas, etc.)
      let node = e.target as Element | null
      while (node && node !== document.documentElement) {
        if (node !== document.body) {
          const { overflow, overflowY } = getComputedStyle(node)
          if ((overflow + overflowY).match(/auto|scroll/)) {
            if ((node as HTMLElement).scrollHeight > (node as HTMLElement).clientHeight + 1) return
          }
        }
        node = node.parentElement
      }

      e.preventDefault()

      // Normalise delta: Firefox uses deltaMode 1 (lines), some browsers use 2 (pages)
      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 40
      else if (e.deltaMode === 2) delta *= window.innerHeight

      target += delta * 0.65
      target = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight))
      wheelActive = true
    }

    const tick = () => {
      if (wheelActive) {
        const diff = target - current
        if (Math.abs(diff) < 0.5) {
          current = target
          wheelActive = false
        } else {
          current += diff * 0.09 // lerp factor — lower = smoother/slower
        }
        window.scrollTo(0, current)
      } else {
        // Stay in sync with native scroll (anchor links, keyboard, programmatic)
        const native = window.scrollY
        if (Math.abs(native - current) > 1) {
          current = native
          target = native
        }
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
