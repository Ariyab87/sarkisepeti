import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    console.log("📩 Email API called:", { name, email, messageLength: message?.length });

    // Validate required fields
    if (!name || !email || !message) {
      console.error("❌ Missing required fields:", { hasName: !!name, hasEmail: !!email, hasMessage: !!message });
      return Response.json(
        { success: false, error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    // Check environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailReceiver = process.env.EMAIL_RECEIVER;

    console.log("🔐 Environment check:", {
      hasUser: !!emailUser,
      hasPass: !!emailPass,
      hasReceiver: !!emailReceiver,
      userLength: emailUser?.length || 0,
      passLength: emailPass?.length || 0,
    });

    if (!emailUser || !emailPass || !emailReceiver) {
      console.error("❌ Missing email configuration");
      return Response.json(
        { success: false, error: "Server email configuration is missing. Please check environment variables." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    console.log("📧 Attempting to send email...");

    await transporter.sendMail({
      from: emailUser,
      to: emailReceiver,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    console.log("✅ Email sent successfully to:", emailReceiver);
    return Response.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    return Response.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
