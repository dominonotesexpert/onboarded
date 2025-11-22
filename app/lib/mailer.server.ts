import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.MAIL_SMTP_HOST;
  const port = Number(process.env.MAIL_SMTP_PORT ?? 587);
  const user = process.env.MAIL_SMTP_USER;
  const pass = process.env.MAIL_SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set MAIL_SMTP_HOST/PORT/USER/PASS.");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return cachedTransporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}): Promise<string> {
  const transporter = getTransporter();
  const from = options.from ?? process.env.MAIL_FROM ?? options.to;

  const info = await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? options.html?.replace(/<[^>]+>/g, " ")
  });

  return info.messageId;
}
