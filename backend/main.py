import math
import random
import time
from typing import Any

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Predictive Maintenance API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SENSOR_KEYS = ("temperature", "vibration", "sound", "current")

CHART_META = {
    "temperature": {"title": "Temperature", "unit": "°C", "color": "#0891b2"},
    "vibration": {"title": "Vibration", "unit": "mm/s", "color": "#7c3aed"},
    "sound": {"title": "Sound", "unit": "dB", "color": "#059669"},
    "current": {"title": "Current", "unit": "A", "color": "#d97706"},
}

BASELINE = {
    "temperature": 68.2,
    "vibration": 3.4,
    "sound": 72.1,
    "current": 11.8,
}

AMPLITUDE = {
    "temperature": 2.0,
    "vibration": 0.5,
    "sound": 3.0,
    "current": 1.0,
}

PHASE = {
    "temperature": 0.0,
    "vibration": 1.2,
    "sound": 2.4,
    "current": 3.6,
}

DECIMALS = {
    "temperature": 1,
    "vibration": 2,
    "sound": 1,
    "current": 1,
}

SIMULATION_START = time.time()
latest_manual_readings: dict[str, dict[str, float | int]] | None = None


def now_ms() -> int:
    return int(time.time() * 1000)


def round_sensor(key: str, value: float) -> float:
    return round(value, DECIMALS[key])


def simulated_value(key: str, timestamp_ms: int) -> float:
    elapsed = timestamp_ms / 1000 - SIMULATION_START
    wave = math.sin(elapsed / 5 + PHASE[key])
    noise = random.uniform(-0.15, 0.15)
    return round_sensor(key, BASELINE[key] + AMPLITUDE[key] * wave + noise)


def build_reading(key: str, value: float, timestamp_ms: int) -> dict[str, float | int]:
    return {"timestamp": timestamp_ms, "value": round_sensor(key, value)}


def build_live_payload(timestamp_ms: int, values: dict[str, float]) -> dict[str, dict[str, float | int]]:
    return {
        key: build_reading(key, values[key], timestamp_ms)
        for key in SENSOR_KEYS
    }


def simulate_live_payload(timestamp_ms: int | None = None) -> dict[str, dict[str, float | int]]:
    ts = timestamp_ms if timestamp_ms is not None else now_ms()
    values = {key: simulated_value(key, ts) for key in SENSOR_KEYS}
    return build_live_payload(ts, values)


def parse_sensor_input(raw: Any, fallback_timestamp: int) -> tuple[float | None, int]:
    if raw is None:
        return None, fallback_timestamp

    if isinstance(raw, dict):
        value = raw.get("value")
        timestamp = raw.get("timestamp", fallback_timestamp)
        if value is None:
            return None, fallback_timestamp
        return float(value), int(timestamp)

    return float(raw), fallback_timestamp


def readings_from_body(body: dict[str, Any], fallback_timestamp: int) -> dict[str, dict[str, float | int]]:
    readings: dict[str, dict[str, float | int]] = {}

    for key in SENSOR_KEYS:
        value, timestamp = parse_sensor_input(body.get(key), fallback_timestamp)
        if value is not None:
            readings[key] = build_reading(key, value, timestamp)

    return readings


def merge_with_simulation(manual: dict[str, dict[str, float | int]], timestamp_ms: int) -> dict[str, dict[str, float | int]]:
    simulated = simulate_live_payload(timestamp_ms)
    merged = simulated.copy()
    merged.update(manual)
    return merged


def build_history_charts(seconds: int = 60) -> dict[str, dict[str, Any]]:
    end = now_ms()
    charts: dict[str, dict[str, Any]] = {}

    for key in SENSOR_KEYS:
        meta = CHART_META[key]
        points = [
            build_reading(key, simulated_value(key, end - offset * 1000), end - offset * 1000)
            for offset in range(seconds, 0, -1)
        ]
        charts[key] = {**meta, "points": points}

    return charts


def latest_values(payload: dict[str, dict[str, float | int]]) -> dict[str, float]:
    return {key: float(payload[key]["value"]) for key in SENSOR_KEYS if key in payload}


def build_sensor_cards(payload: dict[str, dict[str, float | int]]) -> list[dict[str, str]]:
    status_map = {
        "temperature": ("Temperature Sensor", "°C"),
        "vibration": ("Vibration Sensor", "mm/s"),
        "sound": ("Sound Sensor", "dB"),
        "current": ("Current Sensor", "A"),
    }

    sensors = []
    for key, (title, unit) in status_map.items():
        reading = payload.get(key)
        sensors.append(
            {
                "title": title,
                "value": str(reading["value"]) if reading else None,
                "unit": unit,
                "status": "Live",
                "variant": "success",
            }
        )

    return sensors


@app.get("/api/v1/status")
def get_status():
    payload = simulate_live_payload()
    return {
        "sensors": build_sensor_cards(payload),
        "prediction": {
            "title": "PredictionCard",
            "prediction": "Normal Operation",
            "probability": 91,
            "description": "Latest model output",
            "variant": "success",
        },
        "fault": {
            "title": "FaultCard",
            "fault": "No critical fault detected",
            "severity": "Low",
            "description": "Current diagnostic state",
            "variant": "success",
        },
    }


@app.get("/api/v1/history")
def get_history():
    return {"charts": build_history_charts()}


@app.get("/api/v1/recommendations")
def get_recommendations():
    return {
        "recommendations": [
            {
                "title": "Inspect vibration mounting",
                "content": "Validate that the sensor mount is secure before long runtime testing.",
            },
            {
                "title": "Schedule bearing review",
                "content": "Plan a mechanical inspection during the next maintenance window.",
            },
        ]
    }


@app.get("/api/v1/system-info")
def get_system_info():
    return {
        "items": [
            {"label": "Device", "value": "Raspberry Pi 4"},
            {"label": "Firmware", "value": "v1.0.0"},
            {"label": "Model", "value": "Mock API (local dev)"},
        ],
        "systemInfoCard": {
            "title": "System Info",
            "description": "Hardware and software details",
        },
    }


@app.post("/api/v1/live")
def post_live(body: dict[str, Any] = Body(default_factory=dict)):
    """
    Live sensor feed.

    Empty body {}  -> simulated wave data (good for dashboard graphs).
    With values    -> use your real readings; dashboard picks them up on next poll.

    Example:
      {
        "temperature": {"timestamp": 1751558400000, "value": 70.5},
        "vibration": {"value": 3.8},
        "sound": {"value": 74.0},
        "current": {"value": 12.1}
      }
    """
    global latest_manual_readings

    ts = now_ms()
    manual = readings_from_body(body, ts)

    if manual:
        latest_manual_readings = manual
        if len(manual) == len(SENSOR_KEYS):
            return manual
        return merge_with_simulation(manual, ts)

    if latest_manual_readings:
        refreshed = {
            key: build_reading(key, float(reading["value"]), ts)
            for key, reading in latest_manual_readings.items()
        }
        if len(refreshed) == len(SENSOR_KEYS):
            return refreshed
        return merge_with_simulation(refreshed, ts)

    return simulate_live_payload(ts)


@app.delete("/api/v1/live")
def clear_manual_readings():
    """Switch back to automatic simulation."""
    global latest_manual_readings
    latest_manual_readings = None
    return {"message": "Manual readings cleared. Using simulation again."}
