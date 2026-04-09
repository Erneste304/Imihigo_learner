import path from 'path'
import { Express } from 'express'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, '../dist')
  const express = (await import('express')).default
  app.use(express.static(distPath))
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}
