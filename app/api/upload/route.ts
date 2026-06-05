import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `quest-${Date.now()}.${ext}`

    const dir = path.join(process.cwd(), 'public', 'quests')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), buffer)

    return NextResponse.json({ url: `/quests/${filename}` })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}
