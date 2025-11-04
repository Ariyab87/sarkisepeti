import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    console.log("📩 Email API called:", { name, email, message });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    console.log("✅ Email sent successfully");
    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return Response.json({ success: false, error: (error as Error).message });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
