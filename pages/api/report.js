import path from 'path'
import fs from 'fs'

export default function handler(req, res) {
  const { pin } = req.query
  if (!pin) return res.status(400).json({ error: 'Pin code required' })
  try {
    const scoresPath = path.join(process.cwd(), 'public', 'nqi_scores.json')
    const masterPath = path.join(process.cwd(), 'public', 'master_by_pin.json')
    const scores = JSON.parse(fs.readFileSync(scoresPath, 'utf8'))
    const score = scores.find(r => r.pin_code === pin.trim())
    if (!score) return res.status(404).json({ error: 'Pin code not found in our database' })
    let master = {}
    if (fs.existsSync(masterPath)) {
      const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'))
      master = masterData.find(r => r.pin_code === pin.trim()) || {}
    }
    res.status(200).json({ ...score, ...master })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
