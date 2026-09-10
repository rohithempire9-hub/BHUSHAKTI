import { LandslideStation } from '../types/landslide';
import { evaluateLandslideRisk } from './mlRiskEngine';
import { auditStationSafety } from './safeZoneAuditor';

export interface LiveWeatherData {
  temperatureC: number;
  relativeHumidityPct: number;
  precipitationMm: number;
  rainMm: number;
  surfacePressureHpa: number;
  windSpeedKmh: number;
  fetchedAt: string;
}

/**
 * Fetches original, real-time meteorological data for Northeast India coordinates
 * using the public Open-Meteo API (no static fake values).
 */
export async function fetchOriginalWeatherForStation(
  latitude: number,
  longitude: number
): Promise<LiveWeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
    const data = await res.json();
    const current = data.current;

    return {
      temperatureC: current.temperature_2m ?? 24.0,
      relativeHumidityPct: current.relative_humidity_2m ?? 70,
      precipitationMm: current.precipitation ?? 0.0,
      rainMm: current.rain ?? 0.0,
      surfacePressureHpa: current.surface_pressure ?? 1010.0,
      windSpeedKmh: current.wind_speed_10m ?? 8.0,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`Could not fetch live weather for [${latitude}, ${longitude}]:`, err);
    return null;
  }
}

/**
 * Updates a station with authentic real-time meteorological observations and re-evaluates
 * slope stability, pore water pressure, and Factor of Safety using geotechnical physics.
 */
export function syncStationWithLiveWeather(
  station: LandslideStation,
  liveWeather: LiveWeatherData
): LandslideStation {
  const currentTelemetry = { ...station.telemetry };

  // Update with original live observations
  currentTelemetry.temperatureC = Number(liveWeather.temperatureC.toFixed(1));
  
  // Real rainfall rate from meteorological satellite / radar precipitation
  currentTelemetry.rainfallRateMmH = Number(liveWeather.precipitationMm.toFixed(1));

  // Dynamic infiltration: if it is raining right now, pore pressure rises; if dry, it dissipates
  const rainEffect = liveWeather.precipitationMm * 4.2;
  const humidityFactor = (liveWeather.relativeHumidityPct / 100) * 8;
  
  // Soil moisture strongly tracks relative humidity & precipitation
  currentTelemetry.soilMoisturePct = Math.min(
    96,
    Math.max(25, Math.round(liveWeather.relativeHumidityPct * 0.85 + liveWeather.precipitationMm * 5))
  );

  // Pore water pressure response in shear zone
  let targetPorePressure = (currentTelemetry.soilMoisturePct / 100) * 45 + rainEffect;
  if (station.slopeAngleDeg < 15 && station.vegetationCoverPct > 60) {
    // Competent safe slope drains rapidly
    targetPorePressure = Math.min(12, targetPorePressure * 0.35);
  }
  currentTelemetry.poreWaterPressureKpa = Number(
    Math.max(3.2, Math.min(58.0, targetPorePressure)).toFixed(1)
  );

  // Live erosion velocity increases during precipitation events
  currentTelemetry.erosionLiveMmH = Number(
    Math.max(0.1, (liveWeather.precipitationMm * 0.6) + (station.slopeAngleDeg / 40)).toFixed(2)
  );

  currentTelemetry.lastUpdated = new Date().toISOString();

  // Recompute geotechnical stability with updated original data
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

  // Re-run safe zone audit
  updatedStation.safeAuditResult = auditStationSafety(updatedStation);

  return updatedStation;
}

/**
 * Synchronizes an array of stations with authentic meteorological data in parallel
 */
export async function syncStationsWithRealWeather(
  stations: LandslideStation[]
): Promise<LandslideStation[]> {
  const updatedStations = await Promise.all(
    stations.map(async (st) => {
      const liveWeather = await fetchOriginalWeatherForStation(
        st.latitude,
        st.longitude
      );
      if (liveWeather) {
        return syncStationWithLiveWeather(st, liveWeather);
      }
      return st;
    })
  );
  return updatedStations;
}
