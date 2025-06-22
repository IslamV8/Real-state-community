const nodemailer = require("nodemailer");
module.exports = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: `"RealEstateApp" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};
