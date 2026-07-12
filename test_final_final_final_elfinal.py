import time
import numpy as np
import sounddevice as sd
from datetime import datetime
from collections import Counter
import joblib
import pandas as pd
import requests

# ===== Sensors =====
from gpiozero import MCP3008
import board, busio
import adafruit_adxl34x
from scipy.stats import kurtosis, skew
import librosa
from w1thermsensor import W1ThermSensor

# ================= SETTINGS =================

NUM_READINGS    = 7
SAVE_EVERY      = 10
FS              = 48000
MIC_INDEX       = 2
RECORD_DURATION = 1

# ================= API =================

BASE_URL = "https://mostafa.maksoudaa.com/api/v1"
LIVE_URL = f"{BASE_URL}/live"
HEADERS  = {"Content-Type": "application/json"}

# ================= LOAD MODEL =================

model_lr = joblib.load('/home/elkholypi4/Desktop/prediction edge/logistic_model_v2.pkl')
scaler   = joblib.load('/home/elkholypi4/Desktop/prediction edge/scaler_v2.pkl')

# ================= COLUMNS =================

COLUMNS = [
    'Time',
    'Cur_RMS','Cur_STD','Cur_Peak','Cur_Crest','Cur_ZCR',
    'Vib_RMS','Vib_Peak','Vib_P2P','Vib_Crest',
    'Vib_Kurtosis','Vib_Skew',
    'Vib_Centroid','Vib_Bandwidth','Vib_Energy','Vib_Entropy',
    'Snd_RMS','Snd_STD','Snd_Peak','ZCR',
    'Snd_Centroid','Snd_Bandwidth','Snd_Energy',
    'MFCC_1','MFCC_2','MFCC_3','MFCC_4','MFCC_5','MFCC_6','MFCC_7',
    'MFCC_8','MFCC_9','MFCC_10','MFCC_11','MFCC_12','MFCC_13'
]

COLS_TO_DROP = ['Time','Cur_STD','Cur_Peak','Vib_Peak','Vib_P2P','Snd_STD','Snd_Peak']

# ================= SENSORS INIT =================

adc         = MCP3008(channel=0)
i2c         = busio.I2C(board.SCL, board.SDA)
acc         = adafruit_adxl34x.ADXL345(i2c)
temp_sensor = W1ThermSensor()

# ================= FUNCTIONS =================

def read_current_features():
    samples = []
    for _ in range(400):
        samples.append(adc.value * 1.8)
    samples  = np.array(samples)
    centered = samples - np.mean(samples)
    peak     = np.max(np.abs(centered))
    if peak < 0.02:
        return 0, 0, 0, 0, 0
    rms   = np.sqrt(np.mean(centered**2))
    std   = np.std(centered)
    crest = peak / rms if rms != 0 else 0
    zcr   = len(np.where(np.diff(np.sign(centered)))[0]) / len(centered)
    return rms, std, peak, crest, zcr

def read_vibration():
    samples = []
    for _ in range(128):
        x, y, z = acc.acceleration
        samples.append(np.sqrt(x**2 + y**2 + z**2))
    samples  = np.array(samples)
    samples -= np.mean(samples)
    rms      = np.sqrt(np.mean(samples**2))
    peak     = np.max(np.abs(samples))
    ptp      = np.ptp(samples)
    crest    = peak / rms if rms != 0 else 0
    kurt     = kurtosis(samples)
    skewness = skew(samples)
    fft_vals  = np.abs(np.fft.fft(samples))[:len(samples)//2]
    freqs     = np.fft.fftfreq(len(samples), d=0.002)[:len(samples)//2]
    centroid  = np.sum(freqs * fft_vals) / np.sum(fft_vals)
    bandwidth = np.sqrt(np.sum(((freqs - centroid)**2) * fft_vals) / np.sum(fft_vals))
    energy    = np.sum(fft_vals**2)
    power     = fft_vals**2
    p_norm    = power / np.sum(power)
    entropy   = -np.sum(p_norm * np.log2(p_norm + 1e-12))
    return rms, peak, ptp, crest, kurt, skewness, centroid, bandwidth, energy, entropy

def sound_features(audio):
    audio_ds  = librosa.resample(audio, orig_sr=48000, target_sr=16000)
    rms       = np.sqrt(np.mean(audio_ds**2))
    std       = np.std(audio_ds)
    peak      = np.max(np.abs(audio_ds))
    zcr       = np.mean(librosa.feature.zero_crossing_rate(audio_ds))
    centroid  = np.mean(librosa.feature.spectral_centroid(y=audio_ds, sr=16000))
    bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=audio_ds, sr=16000))
    fft       = np.fft.fft(audio_ds)
    energy    = np.mean(np.abs(fft)**2)
    mfccs     = librosa.feature.mfcc(y=audio_ds, sr=16000, n_mfcc=13)
    mfcc_vals = [np.mean(mfccs[i]) for i in range(13)]
    return rms, std, peak, zcr, centroid, bandwidth, energy, mfcc_vals

def read_temp():
    for _ in range(5):
        try:
            t = temp_sensor.get_temperature()
            if t != 85.0:
                return t
        except:
            pass
        time.sleep(0.2)
    return None

def take_reading():
    audio = sd.rec(
        int(RECORD_DURATION * FS),
        samplerate=FS, channels=1,
        device=MIC_INDEX,
        dtype='float32'
    )
    sd.wait()
    audio = audio.flatten()

    cur = read_current_features()
    vib = read_vibration()
    snd_rms, snd_std, snd_peak, zcr, sc, sbw, s_energy, mfcc = sound_features(audio)

    row = [
        str(datetime.now()),
        *cur,
        *vib,
        snd_rms, snd_std, snd_peak,
        zcr, sc, sbw, s_energy,
        *mfcc
    ]
    return row

def predict(all_readings):
    df           = pd.DataFrame(all_readings, columns=COLUMNS)
    df           = df.drop(columns=COLS_TO_DROP)
    X_scaled     = scaler.transform(df)
    predictions  = model_lr.predict(X_scaled)
    probs        = model_lr.predict_proba(X_scaled)
    final_result = Counter(predictions).most_common(1)[0][0]
    confidence   = int(round(max(Counter(predictions).values()) / NUM_READINGS * 100))
    return predictions, probs, final_result, confidence

# ================= POST FUNCTIONS =================

def post_live(temp, cur_rms, vib_rms, snd_rms,final_result):
    ts = int(time.time() * 1000)
    payload = {
        "temperature": {"timestamp": ts, "value": round(float(temp), 2) if temp is not None else 0},
        "current":     {"timestamp": ts, "value": round(float(cur_rms * 1000), 4)},
        "vibration":   {"timestamp": ts, "value": round(float(vib_rms), 4)},
        "sound":       {"timestamp": ts, "value": round(float(snd_rms), 4)},
        "detectedCondition":final_result
    }
    try:
        r = requests.post(LIVE_URL, json=payload, headers=HEADERS, timeout=5)
        print(r.json())
        return r.status_code == 200
    except Exception as e:
        print(f"Live POST failed: {e}")
        return False


# ================= MAIN LOOP =================

cycle = 0
final_result = "Good100"
while True:

    cycle        += 1
    all_readings  = []
    second_count  = 0
    last_temp     = None   # ← بنحفظ آخر قراية حرارة

    print(f"\n{'='*50}")
    print(f"🔁 Cycle {cycle} — collecting {NUM_READINGS} readings...")
    print(f"{'='*50}\n")
    # Request 7 readings from the sensor
    while len(all_readings) < NUM_READINGS:

        second_count += 1

        row  = take_reading()
        temp = read_temp()

        if temp is not None:
            last_temp = temp   # ← بنحدث آخر قراية صح

        cur_rms = row[1]
        vib_rms = row[6]
        snd_rms = row[16]

        temp_str = f"{temp:.2f} °C" if temp is not None else "N/A"
        print(f"  ⏱️  Second {second_count:03d} | 🌡️ {temp_str} | ⚡ Cur: {cur_rms:.4f} | 📳 Vib: {vib_rms:.4f} | 🔊 Snd: {snd_rms:.4f}", end="")

        ok = post_live(temp, cur_rms, vib_rms, snd_rms, final_result)
        print(f" | 📤 {'OK' if ok else 'FAIL'}", end="")

        if second_count == 1 or second_count % SAVE_EVERY == 0:
            all_readings.append(row)
            print(f"  ← ✅ Saved! ({len(all_readings)}/{NUM_READINGS})", end="")

        print()
        time.sleep(1)

    # ===== Prediction =====
    print(f"\n🤖 Running prediction...")
    predictions, probs, final_result, confidence = predict(all_readings)

    print(f"📊 Predictions : {predictions.tolist()}")
    print(f"🏆 Final Result: {final_result} ({confidence}%)")
    print(f"\n🔄 Restarting\n")
