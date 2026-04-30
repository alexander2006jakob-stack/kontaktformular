export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, phone, service, complaint, lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Standort erforderlich" });
    }

    const message = `
Name: ${name}
Telefon: ${phone}
Leistung: ${service}

Standort:
Lat: ${lat}
Lng: ${lng}

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
        to: ["test.P1.alexjakob@gmail.com"],
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
