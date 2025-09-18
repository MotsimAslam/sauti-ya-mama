class Orchestrator:
    def __init__(self):
        from .triage_agent import triage_symptoms
        from .voice_agent import generate_health_alert
        self.triage = triage_symptoms
        self.generate_alert = generate_health_alert

    def handle_user_input(self, patient_id: str, symptom_text: str):
        print(f"Orchestrator: Received input from patient {patient_id}: '{symptom_text}'")

        diagnosis = self.triage(symptom_text, patient_id)
        result = {"diagnosis": diagnosis}
        
        if diagnosis["risk"] in ["HIGH", "MEDIUM"]:
            print("Orchestrator: Generating voice alert...")
            audio_data = self.generate_alert(diagnosis["recommendation"], patient_id)
            result["audio_alert"] = audio_data

        print("Orchestrator: Workflow complete.")
        return result