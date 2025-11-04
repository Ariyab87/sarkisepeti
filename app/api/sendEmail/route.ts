// @ts-nocheck
export async function POST(req) {
  try {
    console.log("📩 Email API called");
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return Response.json(
        { success: false, error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    const sender = process.env.TEST_EMAIL;
    const password = process.env.TEST_EMAIL_PASS;

    if (!sender || !password) {
      console.error("Missing TEST_EMAIL or TEST_EMAIL_PASS env vars");
      return Response.json(
        { success: false, error: "Server email configuration is missing" },
        { status: 500 }
      );
    }

    const nodemailer = (await import("nodemailer")).default;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: sender,
      to: sender,
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<div style=\"font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;\">`
          + `<h2>New message</h2>`
          + `<p><strong>Name:</strong> ${name}</p>`
          + `<p><strong>Email:</strong> ${email}</p>`
          + `<p><strong>Message:</strong></p>`
          + `<p>${String(message).replace(/\n/g, "<br/>")}</p>`
          + `</div>`,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("sendEmail POST error", err);
    return Response.json(
      { success: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
