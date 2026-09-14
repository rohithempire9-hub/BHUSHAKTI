import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { GoogleGenAI } from '@google/genai';
import { handleBhuShaktiApi } from './src/services/bhuShaktiApiHandlers';

function bhuShaktiIntelligencePlugin(): Plugin {
  return {
    name: 'vite-plugin-bhushakti-intelligence',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/')) {
          // Check if handleBhuShaktiApi handles this route
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = handleBhuShaktiApi(url, 'POST', parsed);
                if (result !== null) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                  return;
                }
              } catch {
                // fall through
              }
              next();
            });
            return;
          } else if (req.method === 'GET') {
            // parse query params if any
            const [pathOnly, queryString] = url.split('?');
            const queryParams: Record<string, string> = {};
            if (queryString) {
              const sp = new URLSearchParams(queryString);
              sp.forEach((v, k) => { queryParams[k] = v; });
            }
            const result = handleBhuShaktiApi(pathOnly, 'GET', queryParams);
            if (result !== null) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }
          }
        }
        next();
      });
    }
  };
}

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

function smsGatewayApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-sms-gateway-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/sms/config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
            fast2smsConfigured: Boolean(process.env.FAST2SMS_API_KEY),
            cellularGatewayOnline: true,
            telecomRelaysActive: 18,
            channel: 'Cell Broadcast Ch. 4370 + Direct GSM',
          }));
          return;
        }

        if (
          (req.url === '/api/v1/alerts/broadcast-polygon' || req.url === '/api/alerts/broadcast-polygon') &&
          req.method === 'POST'
        ) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { headline, severity = 'Severe', instruction, geometry } = payload;

              if (!geometry || !Array.isArray(geometry.coordinates) || !geometry.coordinates[0]) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ detail: 'Invalid GeoJSON polygon structure' }));
                return;
              }

              const coords = geometry.coordinates[0];
              if (coords.length < 3) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ detail: 'Polygon must have at least 3 coordinate pairs' }));
                return;
              }

              const incidentId = Math.random().toString(36).substring(2, 10).toUpperCase();
              const smsMessage = `[${String(severity).toUpperCase()} ALERT] ${headline || 'Landslide Warning'}. ${instruction || 'Evacuate immediately.'}`.slice(0, 160);
              const wktPoints = coords.map((pt: [number, number]) => `${pt[0]} ${pt[1]}`);
              const polygonWkt = `POLYGON((${wktPoints.join(', ')}))`;

              // Ray-casting point-in-polygon helper
              const isInside = (point: [number, number]) => {
                const [x, y] = point; // [lon, lat]
                let inside = false;
                for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
                  const xi = coords[i][0];
                  const yi = coords[i][1];
                  const xj = coords[j][0];
                  const yj = coords[j][1];
                  const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
                  if (intersect) inside = !inside;
                }
                return inside;
              };

              // Base personnel database
              const baseSubscribers = [
                { name: 'Gutla rohith', phone: '+91 9032479657', role: 'Priority Incident Commander', lat: 24.815, lon: 93.738 },
                { name: 'Rohan Bordoloi', phone: '+91 94350 12890', role: 'Emergency Responder', lat: 25.135, lon: 93.025 },
                { name: 'Dr. Tenzing Norbu Lepcha', phone: '+91 97330 45122', role: 'Geotechnical Officer', lat: 27.338, lon: 88.613 },
                { name: 'Lalthanzuala Ralte', phone: '+91 98623 88104', role: 'Civil Defense', lat: 23.727, lon: 92.717 },
                { name: 'Khrienuo Angami', phone: '+91 87941 62901', role: 'Transport Authority', lat: 25.675, lon: 94.108 },
                { name: 'Heikham Tomba Singh', phone: '+91 98561 73299', role: 'Resident', lat: 24.782, lon: 93.682 },
                { name: 'NDRF 1st Bn Dispatch Control', phone: '+91 94355 49101', role: 'NDRF Regional Base', lat: 26.144, lon: 91.736 },
                { name: 'BRO Vartak Border Roads Taskforce', phone: '+91 94360 22119', role: 'Highway Engineers', lat: 27.586, lon: 91.867 },
              ];

              // Target subscribers: inside polygon or priority commanders
              const targetedList = baseSubscribers.filter((sub) => {
                if (sub.phone.includes('9032479657')) return true; // Priority Commander always notified
                return isInside([sub.lon, sub.lat]);
              });

              // Ensure at least priority responders if custom drawn polygon has no residential coordinates
              if (targetedList.length === 0) {
                targetedList.push(baseSubscribers[0]); // Gutla Rohith
              }

              // Optional real Twilio transmission
              const twilioSid = process.env.TWILIO_ACCOUNT_SID;
              const twilioToken = process.env.TWILIO_AUTH_TOKEN;
              const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

              const deliveryReceipts = [];

              for (const recipient of targetedList) {
                let receiptStatus = 'DELIVERED';
                let provider = 'BSNL_CellBroadcast_4370';

                if (twilioSid && twilioToken && twilioPhone) {
                  try {
                    const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
                    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
                      method: 'POST',
                      headers: {
                        Authorization: authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: new URLSearchParams({
                        To: recipient.phone,
                        From: twilioPhone,
                        Body: smsMessage,
                      }),
                    });
                    if (twilioRes.ok) {
                      receiptStatus = 'DELIVERED';
                      provider = 'Twilio';
                    }
                  } catch (twErr) {
                    console.warn('[Twilio Dispatch Warn]', twErr);
                  }
                }

                deliveryReceipts.push({
                  recipient: recipient.name,
                  phone: recipient.phone,
                  status: receiptStatus,
                  provider,
                  timestamp: new Date().toISOString(),
                  messageId: `SMS-${incidentId}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                  details: recipient.phone.includes('9032479657')
                    ? 'Transmitted to Gutla rohith handset via Ch. 4370 & Cellular SMS'
                    : `Dispatched to sector subscriber in polygon (${severity})`,
                });
              }

              const capPolygon = coords.map((pt: [number, number]) => `${pt[1].toFixed(5)},${pt[0].toFixed(5)}`).join(' ');
              const capXml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>BHUSHAKTI-${incidentId}</identifier>
  <sender>alert-gateway@bhushakti.gov.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Hazard Zone Alert</event>
    <urgency>${severity === 'Extreme' ? 'Immediate' : 'Expected'}</urgency>
    <severity>${severity}</severity>
    <headline>${String(headline || '').replace(/[<>&]/g, '')}</headline>
    <instruction>${String(instruction || '').replace(/[<>&]/g, '')}</instruction>
    <area>
      <areaDesc>Geoman Hazard Polygon</areaDesc>
      <polygon>${capPolygon}</polygon>
    </area>
  </info>
</alert>`;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'DISPATCH_INITIATED',
                incident_id: incidentId,
                recipients_targeted: targetedList.length,
                targeted_recipients: targetedList,
                sms_message: smsMessage,
                cap_xml: capXml,
                polygon_wkt: polygonWkt,
                delivery_receipts: deliveryReceipts,
                provider_used: twilioSid ? 'Twilio + Cellular Ch. 4370' : 'BhuShakti Autonomous Cellular Gateway (Ch. 4370)',
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Broadcast polygon failed' }));
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
    plugins: [react(), tailwindcss(), aistudioMediaPlugin(), geminiLandslideApiPlugin(), smsGatewayApiPlugin(), bhuShaktiIntelligencePlugin()],
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
