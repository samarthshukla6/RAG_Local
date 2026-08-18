from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime

def generate_medical_report(patient_name, age, gender, patient_id, diagnosis, stage, symptoms, treatment, doctor_name, hospital_name):
    file_name = f"{patient_name.replace(' ', '_')}_Medical_Report.pdf"
    c = canvas.Canvas(file_name, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, height - 50, hospital_name)
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Patient Name: {patient_name}")
    c.drawString(50, height - 100, f"Age: {age} years")
    c.drawString(50, height - 120, f"Gender: {gender}")
    c.drawString(50, height - 140, f"Patient ID: {patient_id}")
    c.drawString(50, height - 160, f"Date of Report: {datetime.today().strftime('%Y-%m-%d')}")

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 200, "Diagnosis & Findings")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 220, f"Diagnosis: {diagnosis}")
    c.drawString(50, height - 240, f"Stage: {stage}")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 270, "Symptoms & Observations")
    c.setFont("Helvetica", 12)
    y_position = height - 290
    for symptom in symptoms:
        c.drawString(50, y_position, f"- {symptom}")
        y_position -= 20

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position - 20, "Treatment Plan")
    c.setFont("Helvetica", 12)
    y_position -= 40
    for item in treatment:
        c.drawString(50, y_position, f"- {item}")
        y_position -= 20

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position - 20, "Doctor's Remarks")
    c.setFont("Helvetica", 12)
    c.drawString(50, y_position - 40, "The patient is advised to follow the prescribed treatment plan,")
    c.drawString(50, y_position - 60, "maintain a healthy diet, and attend follow-up appointments.")
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position - 100, f"Doctor: {doctor_name}")
    c.drawString(50, y_position - 120, "Signature: ____________________________")
    
    c.save()
    print(f"Medical report generated: {file_name}")

# Example Usage
generate_medical_report(
    patient_name="John Doe",
    age=52,
    gender="Male",
    patient_id="JD-459832",
    diagnosis="Non-Small Cell Lung Cancer",
    stage="Stage III",
    symptoms=["Chronic cough", "Shortness of breath", "Chest pain", "Fatigue", "Weight loss"],
    treatment=["Chemotherapy (Cisplatin + Etoposide)", "Radiation Therapy", "Targeted Therapy (Erlotinib)", "Pain Management"],
    doctor_name="Dr. Sarah Mitchell",
    hospital_name="City Oncology Center"
)
