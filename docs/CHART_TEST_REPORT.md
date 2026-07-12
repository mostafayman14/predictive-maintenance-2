# Chart Test Report

**Role:** Senior Test Engineer  
**Scope:** Live charts (UI + data pipeline + API contract)  
**Date:** 2026-07-13  
**Environment checked:** local backend `:8000` (up), Vite `:5173` (down during test)

---

## Executive summary

Charts work for the happy path (history of ~60 simulated points + live append), but there are **contract, unit, lifecycle, and data-integrity issues** that can empty charts, show wrong units, or desync header values from the line.

| Severity | Count |
|----------|------:|
| Critical | 2 |
| High | 4 |
| Medium | 6 |
| Low | 4 |
| **Total** | **16** |

---

## Critical

### CHART-C1 — Static / history points shrink then vanish while page stays open
**Where:** `src/lib/chartUtils.js` → `normalizeChartDataset()`

```js
const endTime = lastTimestamp < now - CHART_WINDOW_MS ? lastTimestamp : now
return trimChartWindow(dataset, endTime)
```

When the latest point is still “fresh” (< 60s old), the window is anchored to **wall-clock `now`**. Any re-normalize (re-render with new array refs, live merge, parent updates) drops older points.

**Reproduced logic:**

| Time after load | Points kept (22-sample history) |
|-----------------|----------------------------------|
| 0s | 22 |
| 45s | 16 |
| 70s | 22 (anchors to last timestamp again) |

**Impact:** Charts can look like they are “losing data” or briefly go empty / waiting during demos if live polling is off or delayed.

**Expected:** Window should anchor to **last data timestamp** (or only to `now` when actively receiving live ticks).

---

### CHART-C2 — Book / real test dataset not served; charts show simulation instead
**Where:** `backend/main.py` → `build_history_charts()`  
**Evidence:** `backend/sample_data/` **does not exist**; history returns ~60 sine-wave points (temp ≈ 66–70°C), not Good100/Good50 lab rows (temp ≈ 25–70°C).

**Impact:** Screenshot / presentation data the team prepared is not what the website shows. Live `POST /live` also returns simulation unless a body is posted.

---

## High

### CHART-H1 — Current unit mismatch (`A` vs `mA`)
**Where:** `src/services/liveDataNormalizer.js` (hardcoded `'mA'`)  
**vs** `mockDashboardData.js` / backend `CHART_META` / status cards (`A`)

After the first live merge, Current chart unit can flip to **mA** while status still says **A**.

**Impact:** Wrong engineering unit on the chart header/tooltip after live connect.

---

### CHART-H2 — Incoming `charts.points` older than 60s are wiped
**Where:** `mergeChartPoints()`  
Uses `trimChartWindow(incomingChart.points, timestamp)` with live/`now` timestamp.

If backend sends a buffered history whose newest point is older than 60s, frontend keeps **zero** points.

---

### CHART-H3 — No sort-by-timestamp before draw
**Where:** `normalizeChartDataset()` / `LiveLineChart`

Unsorted API points are passed straight to Recharts. Monotone line can zigzag / draw backwards.

---

### CHART-H4 — Status sensor values ≠ chart last points
**Where:** `GET /status` builds sensors from a **new** `simulate_live_payload()`; `GET /history` builds an **independent** simulated series.

**Impact:** Header fallback / sensor list can disagree with the line’s last value on first paint (and whenever status refreshes without chart sync).

---

## Medium

### CHART-M1 — Same-timestamp updates ignored
`appendChartPoint` skips `timestamp <= lastPoint.timestamp`.  
Corrected Raspberry values with the same ms never replace the stale point.

---

### CHART-M2 — Y-axis forced to 1 decimal
`LiveLineChart` → `tickFormatter={(v) => Number(v).toFixed(1)}`  
For sound/current ≈ `0.10–0.35`, axis looks nearly flat and hard to read.

---

### CHART-M3 — Missing `charts[key]` renders a layout hole
`SensorLineChart` returns `null` if `chartData` is missing → empty grid cell instead of waiting/error card.

---

### CHART-M4 — Legacy `data: number[]` can inject `NaN`
`createSeedPoints` does `Number(value)` with no finite check (`Number('x') → NaN`).

---

### CHART-M5 — Frontend not running during this test pass
`http://127.0.0.1:5173` returned connection failure.  
UI/visual regression of waiting states / connection badge could not be verified live in this run (API-only + code review).

---

### CHART-M6 — Semantic risk when feeding RMS lab columns into °C / mm/s / dB / A charts
Lab columns (`Cur_RMS`, `Vib_RMS`, `Snd_RMS`) are small fractions; UI still labels them as **A / mm/s / dB**.  
Charts will draw, but values are **not physically comparable** to the unit labels (especially Sound as dB ≈ 0.2).

---

## Low

### CHART-L1 — `windowSeconds` prop is cosmetic
Footer prints `Last {windowSeconds}s` but trimming always uses `CHART_WINDOW_SECONDS = 60`.

---

### CHART-L2 — Duplicate timestamps in history not collapsed
Multiple points with the same `timestamp` survive; tooltips/line can look odd.

---

### CHART-L3 — Future-dated points dropped
If device clock &gt; browser clock, points with `timestamp > endTime` are filtered out.

---

### CHART-L4 — `formatSensorValue` does not limit precision
Long floats (e.g. `0.348199055`) can appear in the header when readings come as strings from API.

---

## What still works (pass)

| Check | Result |
|-------|--------|
| History returns 4 chart keys with `points[{timestamp,value}]` | Pass |
| Point timestamps are Unix ms, monotonic in simulation | Pass |
| Live `POST /live` returns per-sensor `{timestamp,value}` + `detectedCondition` | Pass |
| Line animation disabled (`isAnimationActive={false}`) | Pass |
| Empty chart shows waiting UI (code path) | Pass |
| Error boundary wraps chart grid | Pass |
| Domain auto-pads Y min/max | Pass |
| Dedup prevents out-of-order / older timestamps from appending | Pass (by design; see M1) |

---

## Suggested fix priority

1. **C2** — Restore real sample JSON into history (Good100 / Good50) for demos/screenshots.  
2. **H1** — Change live merge current unit from `mA` → `A`.  
3. **C1** — Anchor chart window to last point timestamp (especially when live polling is off).  
4. **H4** — Drive status sensor cards from the same series as history/live last values.  
5. **H3 / M4 / L2** — Sanitize: sort, drop non-finite, dedupe timestamps.  
6. **M2 / L4** — Adaptive tick/header precision for small magnitudes.

---

## Quick retest checklist (after fixes)

- [ ] Open dashboard with polling **off**: history stays visible for &gt; 2 minutes  
- [ ] Open with polling **on**: line grows; unit for Current stays `A`  
- [ ] POST live with `detectedCondition: "Good50"` + RMS rows: charts + diagnosis update  
- [ ] Omit one chart key in history: UI shows waiting card, not blank hole  
- [ ] Send unsorted points: line is still time-ordered  
- [ ] Vite + API both up; Network tab shows `GET /history` then optional `POST /live`

---

## Notes for stakeholders

This report is based on **code inspection + API probing + deterministic unit logic tests**. Full browser screenshot QA was blocked because the Vite dev server was down during the run. Re-run UI checks once `npm run dev` is up.
