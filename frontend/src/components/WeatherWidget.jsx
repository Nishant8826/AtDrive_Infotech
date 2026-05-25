import React, { useState } from 'react';
import { useGetWeatherQuery } from '../store/api/baseApi';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, RefreshCw, MapPin } from 'lucide-react';

const CITIES = [
  { name: 'Noida (HQ)', lat: '28.5355', lon: '77.3910' },
  { name: 'New Delhi', lat: '28.6139', lon: '77.2090' },
  { name: 'Bangalore', lat: '12.9716', lon: '77.5946' },
  { name: 'Mumbai', lat: '19.0760', lon: '72.8777' },
  { name: 'London', lat: '51.5074', lon: '-0.1278' },
  { name: 'New York', lat: '40.7128', lon: '-74.0060' }
];

const WeatherWidget = () => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  const { data, isLoading: loading, error, refetch } = useGetWeatherQuery({
    lat: selectedCity.lat,
    lon: selectedCity.lon,
    city: selectedCity.name,
  });

  const handleRefresh = () => {
    refetch();
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun size={28} style={{ color: 'var(--warning)' }} />;
    if (code >= 1 && code <= 3) return <Cloud size={28} style={{ color: 'var(--text-secondary)' }} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain size={28} style={{ color: 'var(--secondary-foreground)' }} />;
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return <CloudSnow size={28} style={{ color: 'var(--text-secondary)' }} />;
    if (code >= 95) return <CloudLightning size={28} style={{ color: 'var(--text-primary)' }} />;
    return <Cloud size={28} />;
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return 'Clear';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600' }}>
          <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
          Weather Integration
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <select
          value={selectedCity.name}
          onChange={(e) => {
            const city = CITIES.find(c => c.name === e.target.value);
            if (city) setSelectedCity(city);
          }}
          className="input-field"
          style={{
            padding: '6px 10px',
            fontSize: '0.8rem',
          }}
        >
          {CITIES.map((c) => (
            <option key={c.name} value={c.name} style={{ backgroundColor: 'var(--card)' }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : error ? (
        <div style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '8px 0' }}>
          Error loading weather
        </div>
      ) : data ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            {getWeatherIcon(data.weathercode)}
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: 1 }}>
                {data.temperature}{data.units.temperature}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {getWeatherDesc(data.weathercode)}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            borderTop: '1px solid var(--border)',
            paddingTop: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <div>
              <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '2px' }}>Wind</span>
              <strong style={{ color: 'var(--text-primary)' }}>{data.windspeed} {data.units.windspeed}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--muted-foreground)', marginBottom: '2px' }}>City</span>
              <strong style={{ color: 'var(--text-primary)' }}>{data.city}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WeatherWidget;
