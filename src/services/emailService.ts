import nodemailer from "nodemailer";
import envConfig from "../config/envConfig";
let transporter: nodemailer.Transporter;

export const sendEmail = async ({
  to,
  subject,
  htmlContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
}) => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: envConfig.EMAIL.HOST,
      port: 587,
      secure: false,
      auth: {
        user: envConfig.EMAIL.USER,
        pass: envConfig.EMAIL.PASSWORD,
      },
    });
  }

  // console.log("envconfig", envConfig);

  const mailOptions = {
    from: "mohdhaider.altide@gmail.com",
    to,
    subject,
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};
