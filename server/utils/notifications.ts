// utils/notifications.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER || 'tuusuario@gmail.com',
    pass: process.env.SMTP_PASS || 'tucontraseña',
  },
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const mailOptions = {
    from: `"TaskSur" <${process.env.SMTP_USER || 'tuusuario@gmail.com'}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado a ${to} con asunto: ${subject}`);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
}