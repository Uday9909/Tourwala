import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Search } from 'lucide-react';
import { weatherAPI } from '../api';
import './WeatherWidget.css';

const WeatherWidget = ({ city = "Auto-Detect" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detectedCity, setDetectedCity] = useState(city === "Auto-Detect" ? "" : city);

  useEffect(() => {
    let active = true;

    const resolveLocation = async () => {
      if (city === "Auto-Detect" && !detectedCity) {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
                );
                const result = await response.json();
                const resolved = result.address.city || result.address.town || result.address.village || result.address.state || "New Delhi";
                if (active) setDetectedCity(resolved);
              } catch (err) {
                console.warn("Reverse geocode failed, falling back", err);
                if (active) setDetectedCity("Taj Mahal");
              }
            },
            () => {
              if (active) setDetectedCity("Taj Mahal");
            }
          );
        } else {
          setDetectedCity("Taj Mahal");
        }
      }
    };

    resolveLocation();

    const fetchWeather = async () => {
      const target = detectedCity || (city === "Auto-Detect" ? "" : city);
      if (!target) return;

      setLoading(true);
      try {
        const result = await weatherAPI.getWeather(target);
        if (active) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch weather", e);
        if (active) setLoading(false);
      }
    };

    if (detectedCity) {
      fetchWeather();
    }

    return () => { active = false; };
  }, [city, detectedCity]);

  if (loading || !data) {
    return (
      <div className="weather-pill-brutal skeleton-brutal">
        <div className="mono tiny">CONNECTING_NODE...</div>
      </div>
    );
  }

  const Icon = data.icon === 'sun' ? Sun : (data.icon === 'rain' ? CloudRain : Cloud);

  return (
    <div className="weather-pill-brutal glass-panel">
      <span className="weather-city-brutal mono">
        {data.city ? data.city.toUpperCase() : 'UNKNOWN_NODE'}
      </span>
      <div className="weather-divider-brutal"></div>
      <span className="weather-temp-brutal mono">
        {data.temp}°C
      </span>
      <span className="weather-condition-brutal mono desktop-only">{data.condition.toUpperCase()}</span>
    </div>
  );
};

export default WeatherWidget;
