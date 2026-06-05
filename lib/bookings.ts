export interface Booking {
  id: string
  userName: string
  userEmail: string
  phone: string
  quest: string
  date: string
  time: string
  players: number
  status: 'pending' | 'confirmed' | 'cancelled'
  amount: string
  amountNum?: number  // числовая сумма для расчётов
  createdAt: number
  comment?: string
}

/** Парсим сумму из строки вида "от 2 800 ₽" или числа */
export function parseAmount(v: string | number | undefined): number {
  if (!v) return 0
  if (typeof v === 'number') return v
  return parseInt(v.replace(/\D/g, '')) || 0
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const res = await fetch('/api/bookings')
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function addBooking(b: Booking): Promise<void> {
  await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(b),
  })
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  await fetch('/api/bookings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  })
}
