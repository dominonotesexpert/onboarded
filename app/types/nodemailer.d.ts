declare module "nodemailer" {
  export interface SendMailOptions {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }

  export interface SentMessageInfo {
    messageId: string;
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
  }

  export interface SmtpOptions {
    host: string;
    port: number;
    secure?: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }

  export function createTransport(options: SmtpOptions): Transporter;

  const nodemailer: {
    createTransport: typeof createTransport;
  };

  export {
    SendMailOptions,
    SentMessageInfo,
    Transporter,
    SmtpOptions
  };

  export default nodemailer;
}
