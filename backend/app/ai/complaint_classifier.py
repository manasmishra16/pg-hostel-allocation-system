import json
from app.core.config import settings
from app.schemas.domain import AITriageResponse


class ComplaintClassifier:
    @staticmethod
    def classify(title: str, description: str) -> AITriageResponse:
        text = f"{title} {description}".lower()

        # Deterministic domain rules matching PG/Hostel operations
        if any(w in text for w in ["leak", "tap", "pipe", "water", "flush", "drain", "bathroom", "shower"]):
            category = "PLUMBING"
            department = "Plumbing & Maintenance"
            priority = "HIGH" if any(w in text for w in ["overflow", "spread", "burst", "urgent", "no water"]) else "MEDIUM"
            summary = "Plumbing infrastructure issue requiring maintenance technician visit."
        elif any(w in text for w in ["fan", "light", "switch", "socket", "power", "electricity", "geyser", "wire", "bulb"]):
            category = "ELECTRICAL"
            department = "Electrical Engineering"
            priority = "HIGH" if any(w in text for w in ["spark", "smoke", "burnt", "shock"]) else "MEDIUM"
            summary = "Electrical fixture or wiring malfunction."
        elif any(w in text for w in ["wifi", "internet", "router", "network", "speed", "lan", "connection"]):
            category = "WIFI"
            department = "IT & Networking"
            priority = "MEDIUM" if "slow" in text else "HIGH"
            summary = "Network connectivity disturbance."
        elif any(w in text for w in ["clean", "dust", "garbage", "trash", "smell", "sweep", "mop"]):
            category = "CLEANING"
            department = "Housekeeping"
            priority = "LOW"
            summary = "Housekeeping and sanitization request."
        elif any(w in text for w in ["food", "mess", "meal", "dinner", "lunch", "breakfast", "taste"]):
            category = "FOOD"
            department = "Mess & Dining Committee"
            priority = "MEDIUM"
            summary = "Mess and food quality feedback."
        elif any(w in text for w in ["bed", "chair", "table", "cupboard", "almirah", "door", "lock", "window"]):
            category = "FURNITURE"
            department = "Carpentry & Facilities"
            priority = "MEDIUM"
            summary = "Room furniture repair or replacement required."
        elif any(w in text for w in ["theft", "stranger", "guard", "security", "threat", "unsafe"]):
            category = "SECURITY"
            department = "Hostel Security & Warden"
            priority = "URGENT"
            summary = "Security risk flagged for immediate intervention."
        else:
            category = "OTHER"
            department = "General Administration"
            priority = "LOW"
            summary = "General resident query or maintenance request."

        # Optional OpenAI enhancement if API key is provided
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                prompt = (
                    f"Analyze this hostel complaint and respond ONLY with JSON containing 'category' "
                    f"(one of PLUMBING, ELECTRICAL, WIFI, CLEANING, FOOD, FURNITURE, SECURITY, OTHER), "
                    f"'priority' (LOW, MEDIUM, HIGH, URGENT), 'department', and a 1-sentence 'summary':\n\n"
                    f"Title: {title}\nDescription: {description}"
                )
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                res_data = json.loads(response.choices[0].message.content)
                return AITriageResponse(
                    category=res_data.get("category", category),
                    priority=res_data.get("priority", priority),
                    department=res_data.get("department", department),
                    summary=res_data.get("summary", summary)
                )
            except Exception:
                pass

        return AITriageResponse(
            category=category,
            priority=priority,
            department=department,
            summary=summary
        )
