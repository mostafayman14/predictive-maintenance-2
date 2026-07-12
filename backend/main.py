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
    "sound": {"title": "Sound", "unit": "×10³", "color": "#059669"},
    "current": {"title": "Current", "unit": "mA", "color": "#d97706"},
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
latest_detected_condition: str = "Good100"

CONDITION_CATALOG = {
    "Good100": {
        "diagnosis": "Healthy",
        "recommendedAction": "Motor is operating normally. No maintenance is required.",
        "severity": "Low",
        "variant": "success",
        "probability": 100,
    },
    "Good50": {
        "diagnosis": "Aged Motor",
        "recommendedAction": "Motor is operational but shows signs of aging. Schedule preventive maintenance.",
        "severity": "Medium",
        "variant": "warning",
        "probability": 50,
    },
    "BearingAboutToFail": {
        "diagnosis": "Bearing Degradation",
        "recommendedAction": "Bearing wear has been detected. Replace the bearing within 1–2 weeks to prevent unexpected failure.",
        "severity": "High",
        "variant": "warning",
        "probability": 75,
    },
    "BearingFail": {
        "diagnosis": "Bearing Failure",
        "recommendedAction": "Critical bearing failure detected. Stop operation and replace the bearing immediately.",
        "severity": "Critical",
        "variant": "warning",
        "probability": 95,
    },
    "CapacitorFail": {
        "diagnosis": "Capacitor Fault",
        "recommendedAction": "Capacitor malfunction detected. Replace the capacitor as soon as possible.",
        "severity": "High",
        "variant": "warning",
        "probability": 90,
    },
    "AxeFail": {
        "diagnosis": "Shaft Wear",
        "recommendedAction": "Shaft wear detected. Inspect the shaft and replace it if necessary.",
        "severity": "High",
        "variant": "warning",
        "probability": 85,
    },
    "Overheating": {
        "diagnosis": "Overheating",
        "recommendedAction": "Motor temperature exceeds the safe operating limit. Turn off the motor immediately and inspect the cooling system before restarting.",
        "severity": "Critical",
        "variant": "warning",
        "probability": 98,
    },
}

CONDITION_ALIASES = {
    "good100": "Good100",
    "good50": "Good50",
    "bearingAboutToFail": "BearingAboutToFail",
    "bearingFailure": "BearingFail",
    "bearingFail": "BearingFail",
    "capacitorFailure": "CapacitorFail",
    "capacitorFail": "CapacitorFail",
    "axisFailure": "AxeFail",
    "axeFail": "AxeFail",
    "overheating": "Overheating",
}


def resolve_condition_code(code: str | None) -> str:
    if not code or not isinstance(code, str):
        return "Good100"

    trimmed = code.strip()
    if trimmed in CONDITION_CATALOG:
        return trimmed

    alias = CONDITION_ALIASES.get(trimmed) or CONDITION_ALIASES.get(trimmed.lower())
    if alias:
        return alias

    lower_map = {key.lower(): key for key in CONDITION_CATALOG}
    return lower_map.get(trimmed.lower(), "Good100")


def build_condition_payload(code: str) -> dict[str, Any]:
    resolved = resolve_condition_code(code)
    condition = CONDITION_CATALOG[resolved]

    return {
        "detectedCondition": resolved,
        "diagnosis": condition["diagnosis"],
        "recommendedAction": condition["recommendedAction"],
        "prediction": {
            "title": "Detected Condition",
            "prediction": condition["diagnosis"],
            "probability": condition["probability"],
            "description": condition["recommendedAction"],
            "variant": condition["variant"],
        },
        "fault": {
            "title": "Diagnosis",
            "fault": condition["diagnosis"],
            "severity": condition["severity"],
            "description": condition["recommendedAction"],
            "variant": condition["variant"],
        },
        "recommendations": [
            {
                "title": "Recommended Action",
                "content": condition["recommendedAction"],
                "value": "item-0",
            },
            {
                "title": "Diagnosis",
                "content": condition["diagnosis"],
                "value": "item-1",
            },
            {
                "title": "Condition Code",
                "content": resolved,
                "value": "item-2",
            },
        ],
    }


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


def build_history_charts() -> dict[str, dict[str, Any]]:
    """Return chart shells only. Series memory is owned by the frontend 3h store."""
    return {
        key: {**CHART_META[key], "points": []}
        for key in SENSOR_KEYS
    }

def latest_values(payload: dict[str, dict[str, float | int]]) -> dict[str, float]:
    return {key: float(payload[key]["value"]) for key in SENSOR_KEYS if key in payload}


def build_sensor_cards(payload: dict[str, dict[str, float | int]]) -> list[dict[str, str]]:
    status_map = {
        "temperature": ("Temperature Sensor", "°C"),
        "vibration": ("Vibration Sensor", "mm/s"),
        "sound": ("Sound Sensor", "×10³"),
        "current": ("Current Sensor", "mA"),
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
    condition = build_condition_payload(latest_detected_condition)
    return {
        "sensors": build_sensor_cards(payload),
        "detectedCondition": condition["detectedCondition"],
        "diagnosis": condition["diagnosis"],
        "recommendedAction": condition["recommendedAction"],
        "prediction": condition["prediction"],
        "fault": condition["fault"],
    }


@app.get("/api/v1/history")
def get_history():
    return {"charts": build_history_charts()}


@app.get("/api/v1/recommendations")
def get_recommendations():
    condition = build_condition_payload(latest_detected_condition)
    return {
        "detectedCondition": condition["detectedCondition"],
        "diagnosis": condition["diagnosis"],
        "recommendedAction": condition["recommendedAction"],
        "fault": condition["fault"],
        "recommendations": condition["recommendations"],
    }


@app.get("/api/v1/system-info")
def get_system_info():
    return {
        "items": [
            {"label": "Device", "value": "Raspberry Pi 4"},
            {"label": "Firmware", "value": "v1.0.0"},
            {"label": "Model", "value": "Mock API (local dev)"},
            {"label": "Detected Condition", "value": latest_detected_condition},
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

    Include detectedCondition so the dashboard maps diagnosis + recommended action:

      {
        "detectedCondition": "BearingFail",
        "temperature": {"timestamp": 1751558400000, "value": 70.5},
        "vibration": {"value": 3.8},
        "sound": {"value": 74.0},
        "current": {"value": 12.1}
      }
    """
    global latest_manual_readings, latest_detected_condition

    ts = now_ms()
    manual = readings_from_body(body, ts)

    incoming_condition = body.get("detectedCondition") or body.get("detected_condition")
    if isinstance(incoming_condition, str):
        latest_detected_condition = resolve_condition_code(incoming_condition)

    condition = build_condition_payload(latest_detected_condition)

    if manual:
        latest_manual_readings = manual
        if len(manual) == len(SENSOR_KEYS):
            return {**manual, **condition}
        return {**merge_with_simulation(manual, ts), **condition}

    if latest_manual_readings:
        refreshed = {
            key: build_reading(key, float(reading["value"]), ts)
            for key, reading in latest_manual_readings.items()
        }
        if len(refreshed) == len(SENSOR_KEYS):
            return {**refreshed, **condition}
        return {**merge_with_simulation(refreshed, ts), **condition}

    return {**simulate_live_payload(ts), **condition}


@app.delete("/api/v1/live")
def clear_manual_readings():
    """Switch back to automatic simulation and healthy condition."""
    global latest_manual_readings, latest_detected_condition
    latest_manual_readings = None
    latest_detected_condition = "Good100"
    return {
        "message": "Manual readings cleared. Using simulation again.",
        "detectedCondition": latest_detected_condition,
    }
