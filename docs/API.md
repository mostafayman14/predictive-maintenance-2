# Predictive Maintenance API

API contract for the Motor Predictive Maintenance dashboard frontend.

Share this document with backend developers implementing the Raspberry Pi / ML service.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://mostafa.maksoudaa.com/api/v1` |
| Local dev (Vite proxy) | `http://localhost:5173/api/v1` |
| Local backend direct | `http://localhost:8000/api/v1` |

All paths below are relative to `/api/v1`.

Example:

```text
GET https://mostafa.maksoudaa.com/api/v1/status
POST https://mostafa.maksoudaa.com/api/v1/live
```

---

## Overview

The dashboard loads **4 REST endpoints once on startup**, then optionally polls the **live endpoint** every second for real-time charts.

```text
Page load (parallel):
  GET /status
  GET /history
  GET /recommendations
  GET /system-info

Live updates (if enabled):
  POST /live   every ~1 second
```

| Endpoint | Method | When called | Priority |
|----------|--------|-------------|----------|
| `/status` | GET | Once on page load | High |
| `/history` | GET | Once on page load | High |
| `/recommendations` | GET | Once on page load | Medium |
| `/system-info` | GET | Once on page load | Low |
| `/live` | POST | Polled every 1s (configurable) | **Critical for charts** |

---

## Detected condition (Raspberry Pi prediction)

The Raspberry Pi / ML model should send a single code: **`detectedCondition`**.

The frontend maps that code to:

- **Diagnosis** (shown on Prediction + Fault cards)
- **Recommended Action** (shown as description + recommendations accordion)
- severity / variant / probability for badges

### Allowed codes

| `detectedCondition` | Diagnosis | Recommended Action | Severity |
|---------------------|-----------|--------------------|----------|
| `Good100` | Healthy | Motor is operating normally. No maintenance is required. | Low |
| `Good50` | Aged Motor | Motor is operational but shows signs of aging. Schedule preventive maintenance. | Medium |
| `BearingAboutToFail` | Bearing Degradation | Bearing wear has been detected. Replace the bearing within 1–2 weeks to prevent unexpected failure. | High |
| `BearingFail` | Bearing Failure | Critical bearing failure detected. Stop operation and replace the bearing immediately. | Critical |
| `CapacitorFail` | Capacitor Fault | Capacitor malfunction detected. Replace the capacitor as soon as possible. | High |
| `AxeFail` | Shaft Wear | Shaft wear detected. Inspect the shaft and replace it if necessary. | High |
| `Overheating` | Overheating | Motor temperature exceeds the safe operating limit. Turn off the motor immediately and inspect the cooling system before restarting. | Critical |

### Minimal live payload (recommended for Raspberry Pi)

```json
{
  "detectedCondition": "BearingFail",
  "temperature": { "timestamp": 1751558400000, "value": 68.2 },
  "vibration":   { "timestamp": 1751558400000, "value": 3.4 },
  "sound":       { "timestamp": 1751558400000, "value": 72.1 },
  "current":     { "timestamp": 1751558400000, "value": 11.8 }
}
```

### Status / recommendations payload with condition

```json
{
  "detectedCondition": "Overheating",
  "diagnosis": "Overheating",
  "recommendedAction": "Motor temperature exceeds the safe operating limit. Turn off the motor immediately and inspect the cooling system before restarting."
}
```

> `diagnosis` and `recommendedAction` are optional in the response.  
> If only `detectedCondition` is sent, the frontend fills the rest from its catalog.

### How the UI maps fields

| UI card | Field | Source |
|---------|-------|--------|
| Prediction card title | `Detected Condition` | catalog |
| Prediction main text | Diagnosis | catalog / `diagnosis` |
| Prediction description | Recommended Action | catalog / `recommendedAction` |
| Fault card title | `Diagnosis` | catalog |
| Fault main text | Diagnosis | catalog |
| Fault severity badge | Low / Medium / High / Critical | catalog |
| Recommendations accordion | Recommended Action + Diagnosis + Condition Code | catalog |

### Priority

When multiple sources send a condition:

1. `POST /live` → `detectedCondition` (highest — live updates)
2. `GET /status` → `detectedCondition`
3. `GET /recommendations` → `detectedCondition`

---

## General rules

### Headers

```http
Accept: application/json
Content-Type: application/json   # required for POST /live
```

### Authentication

None. The frontend does not send auth headers today.

### Response wrapper

Both formats are accepted:

```json
{ "prediction": { ... } }
```

```json
{ "data": { "prediction": { ... } } }
```

### HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `4xx` | Client / validation error |
| `5xx` | Server error (GET requests are retried by the frontend) |

### Error body (recommended)

```json
{ "message": "Human-readable error message" }
```

FastAPI-style errors are also supported:

```json
{ "detail": "Validation error message" }
```

### Frontend client behavior

| Setting | Value |
|---------|-------|
| Timeout | 10 seconds |
| GET retries | Up to 2 retries on `429`, `5xx`, or network failure |
| POST `/live` retries | None |

### UI badge variants

Use these values for `variant` fields:

| Value | Meaning |
|-------|---------|
| `default` | Neutral |
| `success` | Healthy / normal |
| `warning` | Attention needed |
| `muted` | Inactive / waiting |

---

## Sensors

The system tracks **4 sensors**. Keys must match exactly.

| Key | Sensor title (for `/status`) | Unit | Chart color |
|-----|------------------------------|------|-------------|
| `temperature` | `Temperature Sensor` | `°C` | `#0891b2` |
| `vibration` | `Vibration Sensor` | `mm/s` | `#7c3aed` |
| `sound` | `Sound Sensor` | `dB` | `#059669` |
| `current` | `Current Sensor` | `A` | `#d97706` |

### Chart point format

```json
{
  "timestamp": 1751558400000,
  "value": 68.2
}
```

| Field | Type | Rules |
|-------|------|-------|
| `timestamp` | `number` | Unix epoch **milliseconds** |
| `value` | `number` | Must be numeric — not `"N/A"` or `null` |

Charts keep a **60-second rolling window** (max 60 points per sensor).

---

## Endpoints

### 1. `GET /status`

Motor status, sensor cards, prediction, and fault summary.

#### Request

```http
GET /api/v1/status
```

No body.

#### Response `200`

```json
{
  "detectedCondition": "Good100",
  "diagnosis": "Healthy",
  "recommendedAction": "Motor is operating normally. No maintenance is required.",
  "sensors": [
    {
      "title": "Temperature Sensor",
      "value": "68",
      "unit": "°C",
      "status": "Normal",
      "variant": "success"
    },
    {
      "title": "Vibration Sensor",
      "value": "3.4",
      "unit": "mm/s",
      "status": "Normal",
      "variant": "success"
    },
    {
      "title": "Sound Sensor",
      "value": "72",
      "unit": "dB",
      "status": "Normal",
      "variant": "success"
    },
    {
      "title": "Current Sensor",
      "value": "11.8",
      "unit": "A",
      "status": "Normal",
      "variant": "success"
    }
  ],
  "prediction": {
    "title": "Detected Condition",
    "prediction": "Healthy",
    "probability": 100,
    "description": "Motor is operating normally. No maintenance is required.",
    "variant": "success"
  },
  "fault": {
    "title": "Diagnosis",
    "fault": "Healthy",
    "severity": "Low",
    "description": "Motor is operating normally. No maintenance is required.",
    "variant": "success"
  }
}
```

#### Field notes

| Field | Required | Used in UI |
|-------|----------|------------|
| `detectedCondition` | **Recommended** | Maps diagnosis + recommended action automatically |
| `sensors` | Recommended | Sensor card values (fallback for charts) |
| `prediction` | Optional if `detectedCondition` sent | Prediction card |
| `fault` | Optional if `detectedCondition` sent | Fault card |
| `overview` | Optional | Not rendered in current layout |
| `healthScore` | Optional | Not rendered in current layout |
| `confidence` | Optional | Not rendered in current layout |
| `connection` | Optional | Overridden by live polling status in navbar |

**Sensor `title` must match exactly:**

- `Temperature Sensor`
- `Vibration Sensor`
- `Sound Sensor`
- `Current Sensor`

---

### 2. `GET /history`

Initial chart data before the first live poll.

#### Request

```http
GET /api/v1/history
```

#### Response `200`

```json
{
  "charts": {
    "temperature": {
      "title": "Temperature",
      "unit": "°C",
      "color": "#0891b2",
      "points": [
        { "timestamp": 1751558400000, "value": 68 },
        { "timestamp": 1751558401000, "value": 69 }
      ]
    },
    "vibration": {
      "title": "Vibration",
      "unit": "mm/s",
      "color": "#7c3aed",
      "points": []
    },
    "sound": {
      "title": "Sound",
      "unit": "dB",
      "color": "#059669",
      "points": []
    },
    "current": {
      "title": "Current",
      "unit": "A",
      "color": "#d97706",
      "points": []
    }
  },
  "sensors": []
}
```

#### Field notes

- All 4 chart keys (`temperature`, `vibration`, `sound`, `current`) should be present.
- `points: []` is valid — charts wait for live data.
- Optional `sensors` array (same shape as `/status`) for initial readings without chart points.

---

### 3. `GET /recommendations`

Maintenance recommendations and optional fault override.

#### Request

```http
GET /api/v1/recommendations
```

#### Response `200`

```json
{
  "fault": {
    "title": "FaultCard",
    "fault": "Bearing wear detected",
    "severity": "Medium",
    "description": "Elevated vibration pattern",
    "variant": "warning"
  },
  "recommendations": [
    {
      "title": "Inspect vibration mounting",
      "content": "Validate that the sensor mount is secure before long runtime testing."
    },
    {
      "title": "Schedule bearing review",
      "content": "Plan a mechanical inspection during the next maintenance window."
    }
  ]
}
```

#### Alternatives accepted

| Instead of | You can send |
|------------|--------------|
| `recommendations` | `items` (same array shape) |

Each item needs `title` and `content`. Optional `value` (e.g. `"item-0"`) for accordion state.

If `fault` is omitted here, the frontend falls back to `fault` from `/status`.

---

### 4. `GET /system-info`

Hardware and system metadata.

#### Request

```http
GET /api/v1/system-info
```

#### Response `200` (object form)

```json
{
  "items": [
    { "label": "Device", "value": "Raspberry Pi 4" },
    { "label": "Firmware", "value": "v1.2.0" },
    { "label": "Model", "value": "XGBoost v1" }
  ],
  "systemInfoCard": {
    "title": "System Info",
    "description": "Hardware and software details"
  }
}
```

#### Alternatives accepted

Top-level array:

```json
[
  { "label": "Device", "value": "Raspberry Pi 4" }
]
```

Or nested under `systemInfo`:

```json
{ "systemInfo": [ { "label": "Device", "value": "Raspberry Pi 4" } ] }
```

> **Note:** Normalized by the frontend but not displayed in the current dashboard layout.

---

### 5. `POST /live` ⭐ Most important

Real-time sensor feed. The frontend polls this endpoint when live polling is enabled.

#### Request

```http
POST /api/v1/live
Content-Type: application/json

{}
```

Default body is an empty object `{}`.

#### Minimum response `200` (recommended)

Each sensor carries its **own** timestamp and value, plus `detectedCondition`:

```json
{
  "detectedCondition": "Good100",
  "temperature": { "timestamp": 1751558400000, "value": 68.2 },
  "vibration":   { "timestamp": 1751558400000, "value": 3.4 },
  "sound":       { "timestamp": 1751558400000, "value": 72.1 },
  "current":     { "timestamp": 1751558400000, "value": 11.8 }
}
```

The frontend maps `detectedCondition` → Diagnosis + Recommended Action automatically.
#### Legacy format (still supported)

```json
{
  "temperature": 68.2,
  "vibration": 3.4,
  "sound": 72.1,
  "current": 11.8,
  "timestamp": "2026-07-03T16:00:01Z"
}
```

With legacy format, all sensors share one top-level `timestamp`.

#### Extended response (optional fields)

```json
{
  "temperature": { "timestamp": 1751558400000, "value": 68.2 },
  "vibration":   { "timestamp": 1751558400000, "value": 3.4 },
  "sound":       { "timestamp": 1751558400000, "value": 72.1 },
  "current":     { "timestamp": 1751558400000, "value": 11.8 },

  "sensorStatus": {
    "temperature": { "status": "Normal", "variant": "success" },
    "vibration":   { "status": "Elevated", "variant": "warning" }
  },

  "prediction": {
    "prediction": "Normal Operation",
    "probability": 91,
    "variant": "success"
  },

  "healthScore": { "score": 87, "status": "Good" },
  "confidence":  { "value": 91 },

  "charts": {
    "temperature": {
      "points": [
        { "timestamp": 1751558400000, "value": 68 },
        { "timestamp": 1751558401000, "value": 69 }
      ]
    }
  }
}
```

#### What the frontend does with each response

1. Appends one chart point per sensor using that sensor's timestamp
2. Skips duplicate timestamps (`timestamp <= last point` is ignored)
3. Trims to a 60-second rolling window
4. Updates the **Last Update** time in the hero banner
5. Updates sensor card values
6. Merges optional `prediction`, `healthScore`, `confidence` if present

#### Sending real sensor data in POST body

The reference backend accepts sensor values in the request body (useful for Raspberry Pi integration):

```json
{
  "temperature": { "value": 70.5 },
  "vibration":   { "value": 3.8 },
  "sound":       { "value": 74.0 },
  "current":     { "value": 12.1 }
}
```

`timestamp` is optional in the body — backend should default to current time.

#### Connection status (navbar badge)

Derived from poll success/failure, not from `/status`:

| State | When |
|-------|------|
| `connecting` | First poll has not succeeded yet |
| `connected` | Poll returned `200` |
| `reconnecting` | Poll failed after a previous success |
| `disconnected` | Polling stopped (page unload) |

---

### 6. `DELETE /live` (reference backend only)

Clears manually injected readings and returns to auto-simulation.

```http
DELETE /api/v1/live
```

```json
{ "message": "Manual readings cleared. Using simulation again." }
```

> Production Raspberry Pi backend may omit this endpoint.

---

## Frontend environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api/v1` | API prefix for all requests |
| `VITE_LIVE_POLLING_ENABLED` | `false` (must be `"true"` to enable) | Toggle live polling |
| `VITE_LIVE_POLL_INTERVAL` | `1000` | Poll interval in ms |
| `VITE_API_PROXY_TARGET` | `http://localhost:8000` | Dev-only Vite proxy target |

Production `.env.production` example:

```env
VITE_API_BASE_URL=/api/v1
VITE_LIVE_POLLING_ENABLED=true
VITE_LIVE_POLL_INTERVAL=1000
```

---

## Testing with curl

Set your base URL:

```bash
# Production
BASE=https://mostafa.maksoudaa.com/api/v1

# Local
BASE=http://localhost:8000/api/v1
```

### Test all endpoints

```bash
curl -s "$BASE/status" | jq
curl -s "$BASE/history" | jq
curl -s "$BASE/recommendations" | jq
curl -s "$BASE/system-info" | jq
curl -s -X POST "$BASE/live" -H "Content-Type: application/json" -d '{}' | jq
```

### Send real sensor data + condition

```bash
NOW=$(python3 -c "import time; print(int(time.time()*1000))")

curl -s -X POST "$BASE/live" \
  -H "Content-Type: application/json" \
  -d "{
    \"detectedCondition\": \"BearingFail\",
    \"temperature\": {\"timestamp\": $NOW, \"value\": 72.5},
    \"vibration\":   {\"timestamp\": $NOW, \"value\": 3.8},
    \"sound\":       {\"timestamp\": $NOW, \"value\": 74.0},
    \"current\":     {\"timestamp\": $NOW, \"value\": 12.1}
  }" | jq
```

### Simulate live polling loop

```bash
while true; do
  curl -s -X POST "$BASE/live" -H "Content-Type: application/json" -d '{}' | jq
  sleep 1
done
```

---

## Implementation priority (MVP)

| Order | Endpoint | Why |
|-------|----------|-----|
| 1 | `POST /live` | Without it, charts stay on "Waiting for live connection" |
| 2 | `GET /history` | Pre-fills charts on page load |
| 3 | `GET /status` | Prediction and fault cards |
| 4 | `GET /recommendations` | Maintenance guidance panel |
| 5 | `GET /system-info` | Optional metadata |

---

## Common issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Charts empty | `/live` not returning numeric values | Return `{ timestamp, value }` per sensor |
| Charts stuck | Invalid timestamps | Use Unix **milliseconds** |
| Header shows `--` | No chart points and no sensor values | Ensure `/live` returns numbers |
| API 502 in production | Backend not running | Check systemd service on port `8010` |
| CORS errors | Cross-origin request | Serve API on same domain via `/api/v1` proxy |
| Live loop unwanted | Polling enabled | Set `VITE_LIVE_POLLING_ENABLED=false` |

---

## Reference implementation

A mock FastAPI backend lives in `backend/main.py`. Interactive docs when running locally:

```text
http://localhost:8000/docs
```

For chart internals and merge logic, see also [CHARTS.md](./CHARTS.md).

---

## Quick reference

```text
GET  /api/v1/status
GET  /api/v1/history
GET  /api/v1/recommendations
GET  /api/v1/system-info
POST /api/v1/live
```

Production base: **https://mostafa.maksoudaa.com/api/v1**
