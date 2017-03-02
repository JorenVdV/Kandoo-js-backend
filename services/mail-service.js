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


}


module.exports = new MailService();