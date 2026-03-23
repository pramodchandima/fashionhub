const nodemailer = require('nodemailer');
const { getPool } = require('../config/db');
const config = require('../config/env');
const { sanitizeInput } = require('../utils/helpers');

// Email sending function (Internal)
async function sendContactEmails({ name, email, subject, message, messageId }) {
    let emailSuccess = false;

    try {
        console.log('📤 Attempting to send emails...');

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: config.EMAIL.HOST,
            port: config.EMAIL.PORT,
            secure: config.EMAIL.PORT === 465,
            auth: {
                user: config.EMAIL.USER,
                pass: config.EMAIL.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        await transporter.verify();

        // Determine recipient
        const adminRecipient = config.EMAIL.ADMIN || config.EMAIL.USER;

        // Email 1: To Admin
        const adminMailOptions = {
            from: `"FashionHub Contact" <${config.EMAIL.USER}>`,
            to: adminRecipient,
            replyTo: email,
            subject: `New Contact: ${subject} (Message #${messageId})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                        <p><strong>Message ID:</strong> #${messageId}</p>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <hr>
                        <p><strong>Message:</strong></p>
                        <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 3px;">${message}</p>
                    </div>
                </div>
            `
        };

        // Email 2: Auto-reply to User
        const userMailOptions = {
            from: `"FashionHub" <${config.EMAIL.USER}>`,
            to: email,
            subject: 'Thank you for contacting FashionHub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Thank You for Contacting Us!</h2>
                    <p>Dear ${name},</p>
                    <p>We have received your message and will get back to you as soon as possible.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Your Message (Preview):</strong></p>
                        <p style="font-style: italic;">"${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"</p>
                    </div>
                    <p>We typically respond within 24 hours.</p>
                    <p>Best regards,<br>The FashionHub Team</p>
                </div>
            `
        };

        // Send emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        emailSuccess = true;

    } catch (emailError) {
        console.error('⚠️ Email sending failed:', emailError.message);
        emailSuccess = false;
    }

    return emailSuccess;
}

exports.submitContactForm = async (req, res) => {
    try {
        console.log('📧 Contact form submission received');

        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: name, email, message'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address'
            });
        }

        const sanitizedName = sanitizeInput(name, 100);
        const sanitizedEmail = sanitizeInput(email, 100);
        const sanitizedSubject = subject ? sanitizeInput(subject, 200) : 'Contact Form Submission';
        const sanitizedMessage = sanitizeInput(message, 5000);

        const pool = getPool();
        const [dbResult] = await pool.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [sanitizedName, sanitizedEmail, sanitizedMessage]
        );

        const messageId = dbResult.insertId;

        let emailSent = false;
        if (config.EMAIL.USER && config.EMAIL.PASS && config.EMAIL.USER !== 'your-email@gmail.com') {
            emailSent = await sendContactEmails({
                name: sanitizedName,
                email: sanitizedEmail,
                subject: sanitizedSubject,
                message: sanitizedMessage,
                messageId: messageId
            });
        }

        let responseMessage = 'Message received successfully! We will contact you soon.';
        if (emailSent) {
            responseMessage += ' (Email confirmation sent)';
        } else {
            responseMessage += ' (Saved to database)';
        }

        res.json({
            success: true,
            message: responseMessage,
            messageId: messageId,
            emailSent: emailSent
        });

    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process your message. Please try again later.'
        });
    }
};

exports.getContactMessages = async (req, res) => {
    try {
        const pool = getPool();
        const [messages] = await pool.query(`
            SELECT * FROM contact_messages 
            ORDER BY created_at DESC
        `);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const messageId = req.params.id;

        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'replied') {
            updateData.replied_at = new Date();
        }

        const pool = getPool();
        await pool.query(
            'UPDATE contact_messages SET status = ?, replied_at = ? WHERE message_id = ?',
            [status, updateData.replied_at, messageId]
        );

        res.json({
            success: true,
            message: 'Message status updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
