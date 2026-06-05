import type { CSSProperties } from 'react'

export type IconName =
  | 'skull' | 'warn' | 'clock' | 'users' | 'trophy' | 'pin' | 'phone'
  | 'mail' | 'chat' | 'check' | 'stop' | 'eye' | 'eye-off' | 'medical'
  | 'door' | 'clipboard' | 'lock' | 'star' | 'target' | 'medal'
  | 'flame' | 'blade' | 'lightning' | 'key' | 'user' | 'settings'
  | 'crown' | 'building' | 'calendar' | 'trash' | 'edit' | 'close'
  | 'shield' | 'theater' | 'home' | 'scroll' | 'anchor' | 'palette'
  | 'close-x' | 'sun' | 'moon' | 'gamepad' | 'rotate'

interface Props {
  name: IconName
  size?: number
  style?: CSSProperties
  className?: string
}

const SVG: Record<IconName, JSX.Element> = {
  skull: (
    <>
      <path d="M12 3C8.7 3 6 5.7 6 9c0 2.6 1.5 4.8 3.8 5.7L9.5 17h5l-.3-2.3C16.5 13.8 18 11.6 18 9c0-3.3-2.7-6-6-6z" />
      <circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M10.5 17h3v1.5h-3z" fill="currentColor" stroke="none" />
    </>
  ),
  warn: (
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  users: (
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  ),
  trophy: (
    <path d="M8 21h8m-4-4v4M4 3h16M5 3v8a7 7 0 0014 0V3M3 7h4m14 0h-4" />
  ),
  pin: (
    <path d="M12 21s-8-6.4-8-11a8 8 0 0116 0c0 4.6-8 11-8 11zm0-7a3 3 0 100-6 3 3 0 000 6z" />
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.09 9.11a19.8 19.8 0 01-3.07-8.67A2 2 0 012.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.16a16 16 0 006.9 6.9l1.43-1.44a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  ),
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </>
  ),
  chat: (
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  ),
  check: (
    <path d="M20 6L9 17l-5-5" />
  ),
  stop: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  ),
  medical: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  door: (
    <>
      <path d="M3 2h12a2 2 0 012 2v16a2 2 0 01-2 2H3V2z" />
      <circle cx="14" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  medal: (
    <>
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      <circle cx="12" cy="8" r="7" />
    </>
  ),
  flame: (
    <path d="M12 21C8.7 21 6 18.3 6 15c0-4 4-9.5 6-13 2 3.5 6 9 6 13 0 3.3-2.7 6-6 6zM9 17c.5 2 2.5 3 3.5 2" />
  ),
  blade: (
    <path d="M14.5 9.5L3 21M12 7l2.5 2.5M18 3l3 3-4.5 4.5-3-3 .5-.5L18 3zm-4 4l-6 6" />
  ),
  lightning: (
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  ),
  key: (
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  ),
  user: (
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
  crown: (
    <path d="M2 20h20M4 8l4 4 4-8 4 8 4-4-2 8H6z" />
  ),
  building: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  edit: (
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  ),
  close: (
    <path d="M18 6L6 18M6 6l12 12" />
  ),
  'close-x': (
    <path d="M18 6L6 18M6 6l12 12" />
  ),
  shield: (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  ),
  theater: (
    <path d="M2 10s3-3 6-3 6 3 6 3m-8 4s1.5 2 4 2 4-2 4-2M16 10s3-3 6-3v9s-3 3-6 3-6-3-6-3V7s3-3 6-3z" />
  ),
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  scroll: (
    <path d="M9 5H4a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-5M9 5a2 2 0 012-2h2a2 2 0 012 2v0M9 5a2 2 0 000 4h6a2 2 0 000-4M9 12h6M9 16h4" />
  ),
  anchor: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v12M5 15c.7 2.7 3.5 5 7 5s6.3-2.3 7-5M3 15h4M17 15h4" />
    </>
  ),
  palette: (
    <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.53-.21-1.01-.54-1.37-.32-.36-.52-.83-.52-1.34 0-1.1.9-2 2-2h2.36c3.13 0 5.7-2.57 5.7-5.7C23 6.12 18.04 2 12 2zm-5.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>
  ),
  moon: (
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  ),
  gamepad: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M6 12h4M8 10v4M15 11h.01M17 13h.01" />
    </>
  ),
  rotate: (
    <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  ),
}

export default function Icon({ name, size = 16, style, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      {SVG[name]}
    </svg>
  )
}
