import axios from 'axios';

const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tSAPI = {
  // Returns API readiness status
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Returns sorted list of all tourist spot names
  getSpots: async () => {
    const response = await apiClient.get('/spots');
    return response.data;
  },

  // Returns a mapping of State -> list of tourist spots within it
  getStates: async () => {
    const response = await apiClient.get('/states');
    return response.data;
  },

  // Returns latest-day snapshot for all (or filtered) spots
  getOverview: async (state = null, limit = 100) => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    params.append('limit', limit);
    const response = await apiClient.get(`/overview?${params.toString()}`);
    return response.data;
  },

  // Runs Inference for a specific spot
  getPrediction: async (spot_name) => {
    const response = await apiClient.get(`/predict/${encodeURIComponent(spot_name)}`);
    return response.data;
  },

  // Simulates Inference with custom parameters
  simulatePrediction: async (spot_name, params) => {
    const response = await apiClient.post(`/simulate/${encodeURIComponent(spot_name)}`, params);
    return response.data;
  },

  // Day-by-day visitor history for spot
  getHistory: async (spot_name, days = 90) => {
    const response = await apiClient.get(`/history/${encodeURIComponent(spot_name)}?days=${days}`);
    return response.data;
  },

  // Returns latest model performance metrics
  getMetrics: async () => {
    const response = await apiClient.get('/metrics');
    return response.data;
  }
};

// Real-time Weather API using wttr.in (keyless Open Data)
export const weatherAPI = {
  getWeather: async (city = "Taj Mahal") => {
    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (!response.ok) throw new Error('Weather feed unavailable');
      const data = await response.json();
      const current = data.current_condition[0];
      
      const status = current.weatherDesc[0].value;
      const isCloudy = status.toLowerCase().includes('cloud') || status.toLowerCase().includes('overcast');
      const isRainy = status.toLowerCase().includes('rain') || status.toLowerCase().includes('drizzle');

      return {
        temp: parseInt(current.temp_C),
        feels_like: parseInt(current.FeelsLikeC),
        humidity: current.humidity,
        wind_speed: current.windspeedKmph,
        condition: status,
        icon: isRainy ? 'rain' : (isCloudy ? 'cloud' : 'sun'),
        city: city
      };
    } catch (e) {
      console.warn("Weather API failed, using fallback", e);
      return {
        temp: 24, feels_like: 26, humidity: 45, wind_speed: 12,
        condition: 'Clear', icon: 'sun', city: city
      };
    }
  },
  
  getForecast: async (city = "Taj Mahal") => {
    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (!response.ok) throw new Error('Forecast feed unavailable');
      const data = await response.json();
      
      return data.weather.map(day => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        high: day.maxtempC,
        low: day.mintempC,
        condition: day.hourly[4].weatherDesc[0].value,
        icon: day.hourly[4].weatherDesc[0].value.toLowerCase().includes('rain') ? 'rain' : (day.hourly[4].weatherDesc[0].value.toLowerCase().includes('cloud') ? 'cloud' : 'sun')
      }));
    } catch (e) {
      return Array.from({ length: 3 }).map((_, i) => ({
        day: 'Node ' + (i+1), high: 28, low: 22, condition: 'Stable', icon: 'sun'
      }));
    }
  }
};
