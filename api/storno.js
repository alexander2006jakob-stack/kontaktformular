import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { token } = req.body;

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'DEINE_EMAIL',   // ← HIER ändern
            subject: 'Termin storniert',
            html: `<p>Storno für Token: ${token}</p>`
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
