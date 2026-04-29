from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
import math
import os
import traceback

EMAIL = os.environ.get("EMAIL")
PASSWORD = os.environ.get("PASSWORD")

if not EMAIL or not PASSWORD:
    raise Exception("EMAIL oder PASSWORD nicht gesetzt!")

app = Flask(__name__)
CORS(app)

# 📍 Ziel-Koordinaten (ANPASSEN!)
TARGET_LAT = 49.4818289
TARGET_LNG = 7.7331569

MAX_DISTANCE_KM = 10


# 📍 Distanz berechnen (Haversine)
def get_distance(lat1, lon1, lat2, lon2):
    R = 6371

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (math.sin(d_lat/2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(d_lon/2) ** 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.json

    name = data.get("name")
    phone = data.get("phone")
    service = data.get("service")
    complaint = data.get("complaint")
    lat = data.get("lat")
    lng = data.get("lng")

    # ✅ 1. Validierung
    if not name or not phone or not service or not complaint:
        return jsonify({"error": "Bitte alle Felder ausfüllen"}), 400

    # 📍 2. Standort prüfen (nur wenn vorhanden)
    if lat is None or lng is None:
        return jsonify({"error": "Standort erforderlich"}), 400

    distance = get_distance(lat, lng, TARGET_LAT, TARGET_LNG)
    
    if distance > MAX_DISTANCE_KM:
        return jsonify({"error": "Außerhalb des erlaubten Bereichs"}), 403

    # ✉️ 3. Mail bauen
    message = f"""
    Name: {name}
    Telefon: {phone}
    Leistung: {service}
    Beschwerde:
    {complaint}
    """

    try:
        # 📬 4. Mail senden
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL, PASSWORD)

            server.sendmail(
                EMAIL,
                EMAIL,
                message
            )

        return jsonify({"success": True})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Mail konnte nicht gesendet werden"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)

