export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, birthdate, phone, service, doctor, complaint, lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Standort erforderlich" });
    }
    const BASE_LAT = 49.4818289;
    const BASE_LNG = 7.7331569;

    const MAX_DISTANCE = 0.1;
    function getDistance(lat1, lon1, lat2, lon2){
      const R = 6371;
      const dLat = (lat2-lat1) * Math.PI / 180;
      const dLon = (lon2-lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI /180) *
        Math.cos(lat2 * Math.PI /180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c
    }
    const distance = getDistance(BASE_LAT, BASE_LNG, lat, lng);
    if (distance > MAX_DISTANCE) {
      return res.status(403).json({
        error: `Außerhalb des erlaubten Bereichs (${distance.toFixed(2)} km)`
      });
    }

    const message = `
Name: ${name}
Geburtsdatum: ${birthdate}
Telefon: ${phone}
Leistung: ${service}
Arzt: ${doctor}
Nachricht:
${complaint}
`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: ["test.p1.alexjakob@gmail.com"],
        subject: "Neue Anfrage",
        text: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return res.status(500).json({ error: "Mail konnte nicht gesendet werden" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
