const nodemailer = require('nodemailer');
require('dotenv').config();

const config = {
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASSWORD,
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.EMAIL_PORT || 587,
    ADMIN: process.env.ADMIN_EMAIL
};

console.log('--- Email Configuration Check ---');
console.log('User:', config.USER);
console.log('Pass:', config.PASS ? '****** (Set)' : 'NOT SET');
console.log('Host:', config.HOST);
console.log('Port:', config.PORT);
console.log('Admin:', config.ADMIN);
console.log('---------------------------------');

async function testEmail() {
    try {
        const transporter = nodemailer.createTransport({
            host: config.HOST,
            port: 465,
            secure: true,
            auth: {
                user: config.USER,
                pass: config.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${config.USER}>`,
            to: config.ADMIN,
            subject: "FashionHub Test Email",
            text: "If you receive this, the email configuration is working correctly.",
            html: "<b>If you receive this, the email configuration is working correctly.</b>"
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testEmail();
