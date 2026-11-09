from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from flight_surgeon import ai_surgeon
import pandas as pd
import asyncio
import time

app = FastAPI(title="AstroPulse Core Engine", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. INGEST THE DATA
print("Loading NASA physiological dataset...")
try:
    df = pd.read_csv("5_SS.csv")
    telemetry_data = df[['TimeSecs', 'ECG', 'R', 'GSR', 'EEG_FP1', 'EEG_F7']].to_dict(orient='records')
    print(f"Successfully loaded {len(telemetry_data)} rows of telemetry.")
except Exception as e:
    telemetry_data = []
    print(f"CRITICAL ERROR: Could not load CSV. Details: {e}")

current_index = 0

# 2. NASA-STD-3001 THRESHOLD LOGIC (Task 1, Step 3)
def apply_nasa_thresholds(data):
    """Checks the astronaut's vitals against strict NASA safety minimums."""
    alerts = []
    if data["spo2"] < 95.0:
        alerts.append(f"Hypoxia Warning: SpO2 dropping to {data['spo2']}%.")
    if data["heart_rate"] > 100:
        alerts.append(f"Cardiac Alert: Elevated heart rate ({data['heart_rate']} BPM).")

    # If there are alerts, flag as CRITICAL. Otherwise, NOMINAL.
    status = "CRITICAL" if len(alerts) > 0 else "NOMINAL"
    return status, alerts

@app.get("/")
async def health_check():
    return {"status": "AstroPulse Core Backend Online. Awaiting Frontend WebSocket Connection."}

# 3. THE WEBSOCKET BRIDGE (Task 1, Step 2)
# 3. THE WEBSOCKET BRIDGE & AI PAYLOAD FORMATTER (Task 1, Step 2)
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    print("Frontend Client Connected. Initiating live telemetry stream...")
    global current_index
    
    try:
        vitals_batch = []
        last_ai_message = '{"agent": "AstroPulse AI", "triage_level": "GREEN", "diagnosis": "Awaiting initial 5-second telemetry batch..."}'

       # Helper function to run the teleanalysis in the background
        async def fetch_ai_diagnosis(batch):
            nonlocal last_ai_message
            try:
                # Extract the newest numbers from the batch
                latest = batch[-1]
                # Pass the exact numbers to Meththani's AI
                last_ai_message = await ai_surgeon.analyze_vitals(latest["heart_rate"], latest["spo2"])
            except Exception as e:
                print(f"Background AI Task Error: {e}")

        while True:
            if not telemetry_data:
                await websocket.send_json({"error": "NASA data not loaded."})
                await asyncio.sleep(1)
                continue
            
            data = telemetry_data[current_index].copy()
            current_index = (current_index + 1) % len(telemetry_data)
            
            data["heart_rate"] = 75 + int(data["ECG"] % 20) 
            data["spo2"] = 98.5
            
            if current_index % 15 == 0:
                data["spo2"] = 93.0
                data["heart_rate"] = 105
                
            data["timestamp"] = int(time.time())
            
            status, alerts = apply_nasa_thresholds(data)
            data["system_status"] = status
            data["active_alerts"] = alerts
            
            vitals_batch.append(data)
            
            if len(vitals_batch) == 5:
                # Fire the teleanalysis into the background so the 1Hz stream never pauses
                asyncio.create_task(fetch_ai_diagnosis(vitals_batch.copy()))
                vitals_batch = [] 
                
            data["ai_surgeon_log"] = last_ai_message
            
            await websocket.send_json(data)
            await asyncio.sleep(1)
                
    except WebSocketDisconnect:
        print("Frontend Client Disconnected. Pausing stream.")