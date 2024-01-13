const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const config = require('./config.json')

const auth = {
  auth: {
    api_key: config.mailgun.key,
    domain: config.mailgun.domain
  },
  host: config.mailgun.host
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const emailTemplateSource = fs.readFileSync(path.join(__dirname, "/template.hbs"), "utf8")
const template = handlebars.compile(emailTemplateSource)

// Recipient email is an array if you have multiple recipients.
const sendMail = (recipientEmail, emailBody) => {
    const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: config.email.subject,
        'replyTo': config.email.replyTo,
        html: template({message: emailBody}),
      }
    
    nodemailerMailgun.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`Mailgun error: ${err}`);
        }
        else {
          console.log(`Response: ${info}`);
        }
      })
}

module.exports = { sendMail }