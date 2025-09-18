import json
import os

class TriageAgent:
    def __init__(self):
        self.rules = {
            "pre_eclampsia": {
                "keywords": ["headache", "blurred vision", "swelling", "swollen hands", "see clearly"],
                "risk": "HIGH",
                "recommendation": "Potential pre-eclampsia. This is serious. Please go to your nearest clinic immediately for a blood pressure check and urine test."
            },
            "fever": {
                "keywords": ["fever", "hot", "chills", "temperature"],
                "risk": "MEDIUM",
                "recommendation": "A fever during pregnancy can be dangerous. Please contact your community health worker or visit a clinic within 24 hours."
            },
            "bleeding": {
                "keywords": ["bleeding", "blood", "spotting"],
                "risk": "HIGH",
                "recommendation": "Bleeding during pregnancy requires immediate medical attention. Please go to the nearest clinic or hospital right away."
            },
            "normal": {
                "risk": "LOW",
                "recommendation": "Thank you for checking in. This sounds within normal range, but always contact a health worker if you are worried."
            }
        }

    def analyze_symptoms(self, text_input: str, patient_history: dict) -> dict:
        text_input = text_input.lower()

        for condition, rule in self.rules.items():
            if condition == "normal":
                continue
            for keyword in rule["keywords"]:
                if keyword in text_input:
                    return {
                        "condition": condition,
                        "risk": rule["risk"],
                        "recommendation": rule["recommendation"],
                        "patient_id": patient_history.get("patient_id")
                    }

        return {
            "condition": "no_urgent_issue_detected",
            "risk": self.rules["normal"]["risk"],
            "recommendation": self.rules["normal"]["recommendation"],
            "patient_id": patient_history.get("patient_id")
        }

def get_patient_history(patient_id: str):
    try:
        with open('data/patient_records.json', 'r') as f:
            patients = json.load(f)
            return patients.get(patient_id, {})
    except FileNotFoundError:
        return {"patient_id": patient_id, "language": "sw", "name": "Demo User"}

def triage_symptoms(text_input: str, patient_id: str) -> dict:
    patient_history = get_patient_history(patient_id)
    agent = TriageAgent()
    result = agent.analyze_symptoms(text_input, patient_history)
    return result