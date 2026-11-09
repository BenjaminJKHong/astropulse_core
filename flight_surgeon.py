import os
import json
from groq import AsyncGroq
from dotenv import load_dotenv

# Load the API key from the .env file securely
load_dotenv()

class AIFlightSurgeon:
    def __init__(self):
        # Initialize Groq client asynchronously
        self.client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
        
        self.system_prompt = """
        You are the AstroPulse AI Flight Surgeon monitoring live astronaut telemetry.
        Analyze the provided data.
        Rule 1: If SpO2 drops below 95.0, issue a RED triage hypoxia warning.
        Rule 2: If Heart Rate exceeds 100 BPM, issue a YELLOW triage cardiac warning.
        Rule 3: Otherwise, triage is GREEN.
        You MUST output ONLY valid JSON in this exact format:
        {"agent": "AstroPulse AI", "triage_level": "GREEN|YELLOW|RED", "diagnosis": "<your 1 sentence medical analysis>"}
        """
        print("Groq AI Flight Surgeon initialized.")

    async def analyze_vitals(self, current_hr, current_spo2):
        try:
            prompt = f"Latest Vitals: HR={current_hr} BPM, SpO2={current_spo2}%. Assess immediately."
            
            # Call Groq's lightning-fast LLaMA 3 model
            response = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                model="llama3-8b-8192",
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Groq API Connection Error: {e}")
            return '{"agent": "AstroPulse AI", "triage_level": "YELLOW", "diagnosis": "Telemetry analysis interrupted. Manual observation required."}'

# Create a global instance for main.py to use
ai_surgeon = AIFlightSurgeon()