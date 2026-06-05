'use client'
import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const curRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse   = useRef({ x: -50, y: -50 })
  const ring    = useRef({ x: -50, y: -50 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (curRef.current) {
        curRef.current.style.left = e.clientX + 'px'
        curRef.current.style.top  = e.clientY + 'px'
      }
    }
    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element).closest('a,button,[data-hover]')
      document.body.classList.toggle('hovering', !!el)
    }
    const onDown = () => { if (curRef.current) curRef.current.style.transform = 'translate(-50%,-50%) scale(.4)' }
    const onUp   = () => { if (curRef.current) curRef.current.style.transform = 'translate(-50%,-50%)' }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)

    let raf: number
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * .15
      ring.current.y += (mouse.current.y - ring.current.y) * .15
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px'
        ringRef.current.style.top  = ring.current.y + 'px'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={curRef}  className={styles.cur}  />
      <div ref={ringRef} className={styles.ring} />
    </>
  )
}
