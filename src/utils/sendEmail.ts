import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 
    
    process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to: string, subject: string, text: string) {
    console.log("Attempting to send email with credentials:", process.env.EMAIL_USER, process.env.EMAIL_PASS);
  const info = await transporter.sendMail({
    from: `"Mi App" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
  });

  console.log("Message sent:", info.messageId);
}


export { sendEmail };