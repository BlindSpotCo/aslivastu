import path from 'path'
import fs from 'fs'

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'nqi_scores.json')
    const scores = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.status(200).json(scores)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
