import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Cloud, CloudRain, Wind, Thermometer, Droplets, CloudLightning } from 'lucide-react';

interface WeatherData {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        maxwind_kph: number;
      };
    }>;
  };
}

const WeatherTab = () => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${import.meta.env.VITE_WEATHERAPI_KEY}&q=${latitude},${longitude}&days=5&aqi=no`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Update weather every 5 minutes
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-40 bg-gray-800 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-800 rounded-2xl"></div>
            <div className="h-64 bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-400">{t('common.error')}</h2>
          <p className="mt-2 text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return Sun;
    if (conditionLower.includes('rain')) return CloudRain;
    if (conditionLower.includes('cloud')) return Cloud;
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return CloudLightning;
    return Cloud;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    if (date.toDateString() === new Date().toDateString()) return t('weather.today');
    if (date.toDateString() === new Date(Date.now() + 86400000).toDateString()) return t('weather.tomorrow');
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-4">{t('weather.title')}</h1>
          <p className="text-gray-400">
            {t('weather.subtitle')}
          </p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <Cloud className="h-32 w-32 text-blue-500/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">{t('weather.current')}</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={`https:${weatherData.current.condition.icon}`}
                alt={weatherData.current.condition.text}
                className="h-20 w-20 mr-6"
              />
              <div>
                <p className="text-4xl font-bold">{Math.round(weatherData.current.temp_c)}°C</p>
                <p className="text-xl text-gray-400">{weatherData.current.condition.text}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
              <Wind className="h-6 w-6 mx-auto text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">{t('weather.wind')}</p>
              <p className="font-semibold">{Math.round(weatherData.current.wind_kph)} km/h</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
              <Droplets className="h-6 w-6 mx-auto text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">{t('weather.humidity')}</p>
              <p className="font-semibold">{weatherData.current.humidity}%</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
              <Thermometer className="h-6 w-6 mx-auto text-red-400 mb-2" />
              <p className="text-sm text-gray-400">{t('weather.feelsLike')}</p>
              <p className="font-semibold">{Math.round(weatherData.current.feelslike_c)}°C</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">{t('weather.forecast')}</h2>
          <div className="space-y-4">
            {weatherData.forecast.forecastday.map((day) => {
              const Icon = getWeatherIcon(day.day.condition.text);
              return (
                <div
                  key={day.date}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-medium w-24">{getDayName(day.date)}</span>
                    <img 
                      src={`https:${day.day.condition.icon}`}
                      alt={day.day.condition.text}
                      className="h-6 w-6"
                    />
                    <span className="text-gray-400">{day.day.condition.text}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-400">{Math.round(day.day.maxwind_kph)} km/h</span>
                    </div>
                    <span className="font-semibold w-16 text-right">{Math.round(day.day.maxtemp_c)}°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">{t('weather.advisory')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center mb-3">
              <Sun className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="font-semibold">{t('weather.morning')}</h3>
            </div>
            <p className="text-gray-400">
              {weatherData.current.temp_c > 25 
                ? t('weather.highTemp')
                : t('weather.normalTemp')}
            </p>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center mb-3">
              <CloudLightning className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="font-semibold">{t('weather.warning')}</h3>
            </div>
            <p className="text-gray-400">
              {weatherData.current.wind_kph > 20 
                ? t('weather.strongWind')
                : t('weather.noWarning')}
            </p>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center mb-3">
              <Wind className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="font-semibold">{t('weather.windAdvisory')}</h3>
            </div>
            <p className="text-gray-400">
              {weatherData.current.wind_kph < 15 
                ? t('weather.sprayingOk')
                : t('weather.sprayingNo')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherTab;