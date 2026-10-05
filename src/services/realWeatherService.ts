import { LandslideStation } from '../types/landslide';
import { evaluateLandslideRisk } from './mlRiskEngine';
import { auditStationSafety } from './safeZoneAuditor';

export interface LiveWeatherData {
  temperatureC: number;
  relativeHumidityPct: number;
  precipitationMm: number;
  rainMm: number;
  rainfall24hMm: number;
  surfacePressureHpa: number;
  windSpeedKmh: number;
  fetchedAt: string;
}

/**
 * Fetch real current weather plus the previous 24 hours of precipitation.
 * Humidity is deliberately NOT treated as soil saturation: humid air does not
 * mean that the slope is saturated.
 */
export async function fetchOriginalWeatherForStation(
  latitude: number,
  longitude: number
): Promise<LiveWeatherData | null> {
  try {
    const results = await fetchLiveWeatherBatch([{ latitude, longitude }]);
    return results[0] ?? null;
  } catch (err) {
    console.warn(`Could not fetch live weather for [${latitude}, ${longitude}]:`, err);
    return null;
  }
}

export async function fetchLiveWeatherBatch(
  stations: Array<{ latitude: number; longitude: number }>
): Promise<Array<LiveWeatherData | null>> {
  if (stations.length === 0) return [];

  try {
    const latitudes = stations.map((s) => s.latitude.toFixed(4)).join(',');
    const longitudes = stations.map((s) => s.longitude.toFixed(4)).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&current=temperature_2m,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m&hourly=precipitation&past_days=1&forecast_days=1&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
    const raw = await res.json();
    const datasets = Array.isArray(raw) ? raw : [raw];

    return datasets.map((data) => {
      const current = data.current;
      if (!current) return null;
      const hourlyTimes: string[] = data.hourly?.time ?? [];
      const hourlyRain: number[] = data.hourly?.precipitation ?? [];
      const currentTime = String(current.time ?? '');
      let currentIndex = hourlyTimes.findIndex((time) => time === currentTime);
      if (currentIndex < 0) {
        currentIndex = hourlyTimes.reduce((best, time, index) => {
          const distance = Math.abs(Date.parse(time) - Date.parse(currentTime));
          const bestDistance = Math.abs(Date.parse(hourlyTimes[best] ?? currentTime) - Date.parse(currentTime));
          return distance < bestDistance ? index : best;
        }, 0);
      }
      const startIndex = Math.max(0, currentIndex - 23);
      const rainfall24hMm = hourlyRain
        .slice(startIndex, currentIndex + 1)
        .reduce((sum, value) => sum + Math.max(0, Number(value ?? 0)), 0);

      return {
        temperatureC: current.temperature_2m ?? 24.0,
        relativeHumidityPct: current.relative_humidity_2m ?? 70,
        windSpeedKmh: current.wind_speed_10m ?? 8.0,
        surfacePressureHpa: current.surface_pressure ?? 1010.0,
        precipitationMm: Math.max(0, current.precipitation ?? 0.0),
        rainMm: Math.max(0, current.rain ?? 0.0),
        rainfall24hMm: Number(rainfall24hMm.toFixed(1)),
        fetchedAt: new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('[BhuShakti] Batch live weather fetch failed:', err);
    return stations.map(() => null);
  }
}

/**
 * Convert weather observations into conservative hydrological estimates.
 * We only raise soil moisture/pore pressure when there is actual recent rain.
 */
export function syncStationWithLiveWeather(
  station: LandslideStation,
  liveWeather: LiveWeatherData
): LandslideStation {
  const currentTelemetry = { ...station.telemetry };

  currentTelemetry.temperatureC = Number(liveWeather.temperatureC.toFixed(1));
  currentTelemetry.relativeHumidityPct = Number(liveWeather.relativeHumidityPct.toFixed(0));
  currentTelemetry.windSpeedKmh = Number(liveWeather.windSpeedKmh.toFixed(1));
  currentTelemetry.surfacePressureHpa = Number(liveWeather.surfacePressureHpa.toFixed(1));
  currentTelemetry.rainfallRateMmH = Number(liveWeather.precipitationMm.toFixed(1));
  currentTelemetry.rainfall24hMm = liveWeather.rainfall24hMm;

  const rain24 = liveWeather.rainfall24hMm;
  const currentRain = liveWeather.precipitationMm;

  // Dry baseline. Recent rainfall, not atmospheric humidity, controls saturation.
  // This prevents humid but non-raining locations from becoming falsely critical.
  const rainfallMoistureContribution = Math.min(58, rain24 * 0.65 + currentRain * 2.5);
  const dryBaseline = 24 + Math.min(8, Math.max(0, (liveWeather.relativeHumidityPct - 50) * 0.10));
  currentTelemetry.soilMoisturePct = Number(
    Math.min(92, Math.max(20, dryBaseline + rainfallMoistureContribution)).toFixed(1)
  );

  // Pore pressure responds mainly to actual infiltration. Dry conditions drain down.
  const moistureExcess = Math.max(0, currentTelemetry.soilMoisturePct - 30);
  const rainPressure = Math.min(28, currentRain * 2.2 + rain24 * 0.10);
  let targetPorePressure = 4.5 + moistureExcess * 0.22 + rainPressure;

  if (station.slopeAngleDeg < 15 && station.vegetationCoverPct > 60) {
    targetPorePressure *= 0.55;
  }

  currentTelemetry.poreWaterPressureKpa = Number(
    Math.max(2.5, Math.min(58.0, targetPorePressure)).toFixed(1)
  );

  // Erosion only rises materially when rainfall is actually present.
  currentTelemetry.erosionLiveMmH = Number(
    Math.max(
      0.05,
      currentRain * 0.45 + (currentRain > 2 ? station.slopeAngleDeg / 80 : 0.05)
    ).toFixed(2)
  );

  currentTelemetry.lastUpdated = new Date().toISOString();

  const updatedAssessment = evaluateLandslideRisk(
    currentTelemetry,
    station.slopeAngleDeg,
    station.soilType,
    station.vegetationCoverPct,
    station.faultDistanceKm
  );

  const updatedStation: LandslideStation = {
    ...station,
    telemetry: currentTelemetry,
    riskAssessment: updatedAssessment,
  };

  updatedStation.safeAuditResult = auditStationSafety(updatedStation);
  return updatedStation;
}

export async function syncStationsWithRealWeather(
  stations: LandslideStation[]
): Promise<LandslideStation[]> {
  const weather = await fetchLiveWeatherBatch(
    stations.map((st) => ({ latitude: st.latitude, longitude: st.longitude }))
  );

  return stations.map((st, index) => {
    const liveWeather = weather[index];
    return liveWeather ? syncStationWithLiveWeather(st, liveWeather) : st;
  });
}
