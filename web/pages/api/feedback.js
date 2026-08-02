import nodemailer from 'nodemailer'

// Silent feedback submission — replaces the old mailto: links. Sends via
// Gmail SMTP using an App Password (not a real account password), so no
// third-party form service or database is needed. Requires two env vars
// set in Vercel project settings: GMAIL_USER and GMAIL_APP_PASSWORD.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, area, pin, nqi, grade, page } = req.body || {}

  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    console.error('Feedback not sent — GMAIL_USER / GMAIL_APP_PASSWORD not set in environment')
    return res.status(500).json({ error: 'Feedback service is not configured yet' })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })

    const bodyLines = [
      String(message).trim(),
      '',
      `Area/pin: ${area || pin || '(not specified)'}`,
    ]
    if (nqi != null) bodyLines.push(`NQI shown: ${nqi}${grade ? ` (${grade})` : ''}`)
    if (page) bodyLines.push(`Page: ${page}`)

    await transporter.sendMail({
      from: `"AsliVastu feedback" <${user}>`,
      to: user,
      replyTo: user,
      subject: `AsliVastu feedback${area ? ' — ' + area : pin ? ' — ' + pin : ''}`,
      text: bodyLines.join('\n'),
    })

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Feedback email failed:', e)
    return res.status(500).json({ error: 'Failed to send feedback' })
  }
}
