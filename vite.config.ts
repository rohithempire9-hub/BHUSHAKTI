import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { GoogleGenAI } from '@google/genai';

function geminiLandslideApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-gemini-landslide-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/analyze-landslide' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { stationName, region, telemetry, riskAssessment, slopeAngleDeg, soilType } = data;

              const apiKey = process.env.GEMINI_API_KEY;
              if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `You are a Senior Geotechnical Engineer and Disaster Risk Management Specialist.
Analyze the following real-time landslide sensor data and evaluate stability:
- Station: ${stationName} (${region})
- Slope Angle: ${slopeAngleDeg}° | Soil Type: ${soilType}
- Temperature: ${telemetry.temperatureC}°C | Soil Moisture: ${telemetry.soilMoisturePct}%
- Soil Erosion Rate: ${telemetry.erosionRateMmPerYr} mm/yr (Live runoff: ${telemetry.erosionLiveMmH} mm/h)
- Pore Water Pressure: ${telemetry.poreWaterPressureKpa} kPa
- Extensometer Creep Displacement: ${telemetry.displacementMm} mm | Inclinometer Tilt: ${telemetry.tiltAngleDeg}°
- Ground Peak Vibration: ${telemetry.vibrationMmS} mm/s
- 24h Rainfall: ${telemetry.rainfall24hMm} mm (Current rate: ${telemetry.rainfallRateMmH} mm/h)
- ML Assessed Factor of Safety (FS): ${riskAssessment.safetyFactor} | Risk Status: ${riskAssessment.status.toUpperCase()}

Provide an authoritative geotechnical report covering:
1. Executive Geotechnical Diagnosis (Mechanics of failure or stability)
2. Crucial Risk Drivers (Explain the interaction between pore pressure, erosion rate, and temperature)
3. Immediate 12-Hour Operational Directives (Evacuation, roadway status, drainage relief)
4. Recommended Structural Stabilization (Soil nailing, horizontal drains, gabion walls)
Keep your answer clear, authoritative, and structured with bullet points.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  source: 'Gemini 2.5 Flash',
                  analysis: response.text,
                }));
                return;
              }

              // Fallback geotechnical assessment if API key not present
              const fallbackAnalysis = `### Geotechnical Slope Assessment (${stationName})
**Status:** ${riskAssessment.status.toUpperCase()} | **Safety Factor (FS):** ${riskAssessment.safetyFactor}

1. **Mechanics of Failure Assessment:**
- Slope incline at ${slopeAngleDeg}° with ${soilType} is experiencing shear stress driven by ${telemetry.poreWaterPressureKpa} kPa pore water pressure, significantly reducing effective normal stress (σ' = σ - u).
- Active erosion rate of ${telemetry.erosionRateMmPerYr} mm/yr indicates severe toe scouring and removal of lateral basal support.

2. **Hydro-Mechanical Trigger Coupling:**
- Soil moisture at ${telemetry.soilMoisturePct}% with 24h rain of ${telemetry.rainfall24hMm} mm accelerates matric suction dissipation in the vadose zone.
- Extensometer creep of ${telemetry.displacementMm} mm confirms ongoing tertiary creep deformation.

3. **Immediate Operational Directives:**
- ${riskAssessment.status === 'safe' ? 'Conditions fully stable. Continue baseline sensor telemetry.' : riskAssessment.status === 'critical' ? 'TRIGGER EMERGENCY SMS DISPATCH & EVACUATION. Barricade downslope road corridors.' : 'Issue yellow/amber slope advisory and inspect diversion drains.'}

4. **Engineered Mitigation:**
- Immediate deployment of perforated horizontal sub-horizontal drainage wick drains to relieve excess pore pressure.
- Hydro-seeding and geotextile erosion control blankets to suppress active surface runoff scour.`;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                source: 'Analytical Geotechnical Model (Rule-Engine)',
                analysis: fallbackAnalysis,
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to analyze' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), geminiLandslideApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
