type Handler = (msg: string) => void

class Emitter {
  private listeners: Record<string, Handler[]> = {}
  on(event: string, fn: Handler)  { (this.listeners[event] ??= []).push(fn) }
  off(event: string, fn: Handler) { this.listeners[event] = (this.listeners[event] ?? []).filter(h => h !== fn) }
  emit(event: string, msg: string) { (this.listeners[event] ?? []).forEach(fn => fn(msg)) }
}

export const toastEmitter = new Emitter()
export const toast = (msg: string) => toastEmitter.emit('toast', msg)
