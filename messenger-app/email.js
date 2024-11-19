const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'messangerapp490@gmail.com',
        pass: 'xqomajsqewysjzae',
    },
});

function generateVerificationToken() {
    let token = "";
    for (let i = 0; i < 6; i ++) 
    {
        token += Math.floor(Math.random() * 10);
    }
    return token
}

async function sendVerificationEmail(user, token) {

    await transporter.sendMail({
        from: '"Messanger App" messangerapp490@gmail.com',
        to: user.email,
        subject: 'Email Verification',
        text: `Use the following code to signup for the Messanger App: ${token}`,
    });
}

module.exports = {sendVerificationEmail, generateVerificationToken};