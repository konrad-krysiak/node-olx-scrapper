import '../bootstrap.ts'
import nodemailer from "nodemailer";


class MailingService {
  #transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SOURCE_EMAIL,
      pass: process.env.SOURCE_PWD,
    },
  });

  async sendEmail(recipient: string, subject: string, html:string) {
    try {
      const response = await this.#transporter.sendMail({
        from: process.env.SOURCE_EMAIL,
        to: recipient,
        subject,
        html,
      });
      return response.messageId;
    } catch (e) {
      console.log("Error while sending email!", e);
      return false;
    }
  }
}

export default new MailingService();
