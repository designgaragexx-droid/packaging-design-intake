// Design Garage Packaging Intake — submission endpoint.
// Emails the brief via Resend. Env vars (Vercel):
//   RESEND_API_KEY (required), TO_EMAIL, FROM_EMAIL (optional)

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const KEY = process.env.RESEND_API_KEY;
  const TO = process.env.TO_EMAIL || "design.garage.xx@gmail.com";
  const FROM = process.env.FROM_EMAIL || "Design Garage Intake <onboarding@resend.dev>";
  if (!KEY) return res.status(500).json({ error: "Set RESEND_API_KEY in Vercel." });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: "Invalid JSON" }); }
  }
  body = body || {};

  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sections = Array.isArray(body.sections) ? body.sections : [];
  const files = Array.isArray(body.files) ? body.files : [];

  const row = (label, value) =>
    '<tr><td style="padding:10px 16px;border-bottom:1px solid #e8e5dd;color:#7e7e7f;font:600 11px sans-serif;text-transform:uppercase;letter-spacing:.06em;vertical-align:top;width:34%;">' + esc(label) +
    '</td><td style="padding:10px 16px;border-bottom:1px solid #e8e5dd;color:#2b2b2c;font:15px/1.5 sans-serif;white-space:pre-wrap;">' + esc(value) + "</td></tr>";

  const html =
    '<div style="font-family:sans-serif;max-width:680px;margin:0 auto;">' +
    '<h1 style="font:400 28px sans-serif;letter-spacing:.02em;text-transform:uppercase;color:#2b2b2c;margin:0 0 4px;">New Packaging Brief</h1>' +
    '<p style="color:#7e7e7f;font:14px sans-serif;margin:0 0 28px;">' + esc(body.businessName) + " &middot; " + esc(body.contactName) + " &middot; " + esc(body.contactEmail) + "</p>" +
    sections.map((s) =>
      '<h2 style="font:600 13px sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#2b2b2c;margin:28px 0 8px;">' + esc(s.title) + "</h2>" +
      '<table style="width:100%;border-collapse:collapse;">' + (s.rows || []).map((r) => row(r.label, r.value)).join("") + "</table>"
    ).join("") +
    (files.some((f) => !f.base64) ? '<p style="color:#7e7e7f;font:13px sans-serif;margin-top:20px;">Some files were too large to attach and are listed by name only — request them from the client.</p>' : "") +
    "</div>";

  const attachments = files.filter((f) => f && f.base64).map((f) => ({ filename: f.name, content: f.base64 }));

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: [TO], reply_to: body.contactEmail || undefined,
        subject: "New packaging brief — " + (body.businessName || body.contactName || "Untitled"),
        html, attachments: attachments.length ? attachments : undefined
      })
    });
    if (!r.ok) return res.status(502).json({ error: "Resend rejected the email", detail: await r.text() });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};
