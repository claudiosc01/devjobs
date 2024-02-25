const emailConfig = require('../config/email')
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const util = require('util')

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
})


// Utilizar templates de HandleBars
transport.use('compile', hbs({
    viewEngine: {
        extname: '.handlebars', // handlebars extension
        defaultLayout: '', // Set empty defaultLayout
    },
    viewPath: __dirname+'/../views/emails/', // Path to email template folder
    extName: '.handlebars', // Extension to use
}));


exports.enviar = async (opciones) => {
    const opcionesEmail = {
        from: 'devJobs <noreply@devJobs.com',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo, // Make sure this is 'reset'
        context: {
            resetUrl: opciones.resetUrl
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}