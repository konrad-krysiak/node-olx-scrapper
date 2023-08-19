/* eslint-disable no-console */
import "../bootstrap.ts";
import nodemailer from "nodemailer";

class MailingService {
  private _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SOURCE_EMAIL,
      pass: process.env.SOURCE_PWD,
    },
  });

  async sendEmail(recipient: string, subject: string, html: string) {
    try {
      await this._transporter.sendMail({
        from: process.env.SOURCE_EMAIL,
        to: recipient,
        subject,
        html,
      });
    } catch (e) {
      console.log("Error while sending email.", e);
    }
  }
}

export default new MailingService();
