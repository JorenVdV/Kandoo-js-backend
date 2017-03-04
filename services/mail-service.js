/**
 * Created by nick on 17/02/17.
 */

const nodemailer = require('nodemailer');
var mockTransport = require('../node_modules/nodemailer-mock-transport/index');

class MailService {

    constructor() {
        this.transporter = mockTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "8a279b0f877a1f",
                pass: "5b297d9b847464"
            }
        });
    }

    getTransporter() {
        return this.transporter;
    }


    sendMail() {

        let mailOptions = {
            from: '"Fred Foo 👻" <foo@blurdybloop.com>', // sender address
            to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world ?', // plain text body
            html: '<b>Hello world ?</b>' // html body
        };
        let transporter = nodemailer.createTransport(this.transporter);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
        });
    }

    sendSessionInvite(receivers, sessionTitle) {
        let mailOptions = {
            from: '"No Reply  - TeamJS" <no-reply@TeamJS.xyz>', // sender address
            to: receivers.join(', '), // list of receivers
            subject: 'Invited to session: ' + sessionTitle, // Subject line
            text: 'Dear sir/madam, \n\n You have been invited to join the following session:\n\n' + sessionTitle + '\n\n Please accept or decline your invite by logging onto our platform. \n\n P.S. If you do not yet have an account, please create an account using this email address to accept your invite.', // plain text body
            html: `
            <b>
            <p>Dear sir/madam</p>
            <p>You have been invited to join the following session:</p>
            <p>` + sessionTitle + `</p>
            <p>Please accept or decline your invite by logging onto our platform.</p>
            <p>P.S. If you do not yet have an account, please create an account using this email address to accept your invite.</p>
            </b>` // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log(info);
        });
    }


}


module.exports = new MailService();