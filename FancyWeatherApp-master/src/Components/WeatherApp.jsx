import React, { useEffect, useState } from 'react'
import sunny from '../assets/images/sunny.png'
import cloudy from '../assets/images/cloudy.png'
import rainy from '../assets/images/rainy.png'
import snowy from '../assets/images/snowy.png'
import spinner from '../assets/images/loading.gif'

const WeatherApp = () => {
  const [data, setData] = useState(null)
  const [location, setLocation] = useState('') // For søkeboksen
  const [displayLocation, setDisplayLocation] = useState('Oslo') // For visning i søkefelt
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWeatherByCoords(59.91, 10.75) // Oslo
  }, [])

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true)
    setError('')
  
    try {
      const res = await fetch(`http://localhost:4000/api/weather?lat=${lat}&lon=${lon}`)
      const weatherData = await res.json()
      setData(weatherData)
    } catch (err) {
      console.error('Feil ved henting av værdata:', err)
      setError('Kunne ikke hente værdata.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setLocation(e.target.value)
  }

  const search = async () => {
    if (location.trim() === '') return
  
    setLoading(true)
    setError('')
    try {
      const geoRes = await fetch(`http://localhost:4000/api/geocode?city=${location}`)
      const geoData = await geoRes.json()
  
      if (geoData.length === 0) {
        setError('Sted ikke funnet.')
        setLoading(false)
        return
      }
  
      const lat = geoData[0].lat
      const lon = geoData[0].lon
      setDisplayLocation(geoData[0].display_name) // Sett den valgte plasseringen her
      fetchWeatherByCoords(lat, lon)

      setLocation('')
      
    } catch (err) {
      console.error('Geokoding-feil:', err)
      setError('Kunne ikke hente sted.')
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search()
    }
  }

  const current = data?.properties?.timeseries?.[0]?.data?.instant?.details

  const temperature = current?.air_temperature
  const humidity = current?.relative_humidity
  const windSpeed = current?.wind_speed

  // Farger og bilder basert på temperatur (enkelt eksempel)
  const weatherType =
    temperature > 20
      ? 'Clear'
      : temperature > 5
      ? 'Clouds'
      : temperature <= 0
      ? 'Snow'
      : 'Rain'

  const weatherImages = {
    Clear: sunny,
    Clouds: cloudy,
    Rain: rainy,
    Snow: snowy,
  }

  const weatherImage = weatherImages[weatherType]

  const backgroundImages = {
    Clear: 'linear-gradient(to right, #f3b07c, #fcd283)',
    Clouds: 'linear-gradient(to right, #f7d6d4, #71eeec)',
    Rain: 'linear-gradient(to right, #5bc8fb, #80eaff)',
    Snow: 'linear-gradient(to right, #aff2ff, #fff)',
  }

  const backgroundImage = backgroundImages[weatherType]

  const currentDate = new Date()
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formattedDate = `${daysOfWeek[currentDate.getDay()]}, ${currentDate.getDate()}, ${months[currentDate.getMonth()]}`

  return (
    <div className="container" style={{ backgroundImage }}>
      <div
        className="weather-app"
        style={{
          backgroundImage: backgroundImage.replace('to right', 'to top'),
        }}
      >
        <div className="seach">
          <div className="search-top">
            <i className="fa-solid fa-location-dot"></i>
            <div className="location">{displayLocation || 'Oslo'}</div>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Location"
              value={location}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <i className="fa-solid fa-magnifying-glass" onClick={search}></i>
          </div>
        </div>

        {loading ? (
          <img className="loader" src={spinner} alt="Loading..." />
        ) : error ? (
          <div className="not-found">{error}</div>
        ) : (
          <>
            <div className="weather">
              {weatherImage && <img src={weatherImage} alt="weather icon" />}
              <div className="weather-type">{weatherType}</div>
              <div className="temp">{temperature ? `${Math.round(temperature)}°` : '--'}</div>
            </div>

            <div className="weather-date">
              <p>{formattedDate}</p>
            </div>

            <div className="weather-data">
              <div className="humidity">
                <div className="data-name">Humidity</div>
                <i className="fa-solid fa-droplet"></i>
                <div className="data">{humidity != null ? `${humidity}%` : '--'}</div>
              </div>

              <div className="wind">
                <div className="data-name">Wind</div>
                <i className="fa-solid fa-wind"></i>
                <div className="data">{windSpeed != null ? `${windSpeed} km/h` : '--'}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WeatherApp