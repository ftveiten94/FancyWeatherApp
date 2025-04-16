import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Enkel test-rute
app.get('/', (req, res) => {
  res.send('🌤️ Backend kjører!')
})

// Værdata
app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' })

  try {
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'MyWeatherApp/1.0 (ftveiten@gmail.com)' // <-- Bytt med ekte e-post
        }
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return res.status(500).json({ error: 'MET API-feil', details: text })
    }

    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Intern feil' })
  }
})

// Geokoding
app.get('/api/geocode', async (req, res) => {
  const { city } = req.query
  if (!city) return res.status(400).json({ error: 'Missing city param' })

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json`
    )

    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Geokoding-feil' })
  }
})

app.listen(PORT, () => {
  console.log(`🌍 Server kjører på http://localhost:${PORT}`)
})
