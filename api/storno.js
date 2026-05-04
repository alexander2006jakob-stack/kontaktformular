export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end();
    }

    const { token } = req.body;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: "DEINE_EMAIL",   // ← ändern!
                subject: "Termin storniert",
                html: `<p>Storno für Token: ${token}</p>`
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(500).json({ error: errorText });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
