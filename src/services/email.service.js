require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger Prabhakar" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendRegisterationEmail = async (to, name) => {
  const subject = 'Welcome to Backend Ledger';
  const text = `Hello ${name},\n\nThank you for registering with Backend Ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend Ledger! We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(to, subject, text, html);
}

const sendLoginNotificationEmail = async (to, name) => {
  const subject = 'Login Notification';
  const text = `Hello ${name},\n\nKaho kareja kar lelu login\n\n You have successfully logged in to your Backend Ledger account.\n\nIf you did not initiate this login, please contact our support team immediately.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Kaho Kareja Kar lelu loginYou have successfully logged in to your Backend Ledger account.</p><p>If you did not initiate this login, please contact our support team immediately.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(to, subject, text, html);
};

const sendTransactionNotificationEmail = async (to, name, amount, fromAccount) => {
  const subject = 'Transaction Notification';
  const text = `Hello ${name},\n\nYou have received a transaction of amount ${amount} from account ${fromAccount}.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>You have received a transaction of amount ${amount} from account ${fromAccount}.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(to, subject, text, html);
}

const sendTransactionFailedEmail = async (to, name, amount, fromAccount) => {
  const subject = 'Transaction Failed Notification';
  const text = `Hello ${name},\n\nYour transaction of amount ${amount} from account ${fromAccount} has failed.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Your transaction of amount ${amount} from account ${fromAccount} has failed.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(to, subject, text, html);
}

module.exports = {sendRegisterationEmail, sendLoginNotificationEmail, sendTransactionNotificationEmail, sendTransactionFailedEmail};