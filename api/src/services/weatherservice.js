// Weather API Service using OpenWeatherMap
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const weatherService = {
  // Get current weather by city name
  getWeatherByCity: async (city, country = "IN") => {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${city},${country}&appid=${API_KEY}&units=metric`,
      );
      if (!response.ok) throw new Error("Weather data not available");
      return await response.json();
    } catch (error) {
      console.error("Weather API Error:", error);
      return null;
    }
  },

  // Get weather by coordinates
  getWeatherByCoords: async (lat, lon) => {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
      );
      if (!response.ok) throw new Error("Weather data not available");
      return await response.json();
    } catch (error) {
      console.error("Weather API Error:", error);
      return null;
    }
  },

  // Get 5-day forecast
  getForecast: async (city, country = "IN") => {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?q=${city},${country}&appid=${API_KEY}&units=metric`,
      );
      if (!response.ok) throw new Error("Forecast data not available");
      return await response.json();
    } catch (error) {
      console.error("Forecast API Error:", error);
      return null;
    }
  },
};
