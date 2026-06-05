'use client'
import { useEffect, useRef } from 'react'
import { toastEmitter } from '@/lib/toast'

export default function Toast() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (msg: string) => {
      if (!ref.current) return
      ref.current.textContent = msg
      ref.current.classList.add('show')
      setTimeout(() => ref.current?.classList.remove('show'), 3200)
    }
    toastEmitter.on('toast', handler)
    return () => { toastEmitter.off('toast', handler) }
  }, [])

  return <div ref={ref} className="toast" />
}
