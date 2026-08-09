export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { image, mimeType = 'image/jpeg' } = req.body || {}
  if (!image) return res.status(400).json({ error: 'No image provided' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: image },
            },
            {
              type: 'text',
              text: 'Look at this product image or screenshot. Respond with JSON only (no markdown, no explanation):\n{"name":"short product name max 5 words","emoji":"single most relevant emoji","price":null or number in AUD}\n\nIf a price is visible extract it as a number in AUD. Keep the name short and descriptive.',
            },
          ],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(502).json({ error: err?.error?.message || 'Upstream API error' })
    }

    const data = await response.json()
    const rawText = data?.content?.[0]?.text || '{}'
    const cleaned = rawText.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return res.json({
      name:  typeof parsed.name  === 'string' ? parsed.name  : '',
      emoji: typeof parsed.emoji === 'string' ? parsed.emoji : '🎁',
      price: typeof parsed.price === 'number' ? parsed.price : null,
    })
  } catch (err) {
    console.error('analyze-product:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
