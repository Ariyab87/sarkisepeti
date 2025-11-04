import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    console.log("📩 Email API called:", { name, email });

    // Validate required fields
    if (!name || !email || !message) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    // Validate environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailReceiver = process.env.EMAIL_RECEIVER;

    if (!emailUser || !emailPass || !emailReceiver) {
      console.error("❌ Missing email configuration:", {
        hasUser: !!emailUser,
        hasPass: !!emailPass,
        hasReceiver: !!emailReceiver,
      });
      return NextResponse.json(
        { success: false, error: "Server email configuration is missing" },
        { status: 500 }
      );
    }

    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: emailReceiver,
      subject: `🎵 New Order from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `.trim(),
      html: `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;padding:20px;">
          <h2 style="color:#D4AF37;">🎵 New Order from ${name}</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background:#f5f5f5;padding:15px;border-radius:5px;white-space:pre-wrap;">${String(message).replace(/\n/g, "<br/>")}</div>
        </div>
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Email error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
