const nodemailer = require('nodemailer');

exports.sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email отправлен: %s', info.messageId);
    } catch (error) {
        console.error('Ошибка отправки email:', error);
        throw new Error('Не удалось отправить email');
    }
};

exports.sendEmailToHTML = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent, // Используем HTML-контент
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email отправлен: %s', info.messageId);
    } catch (error) {
        console.error('Ошибка отправки email:', error);
        throw new Error('Не удалось отправить email');
    }
};

exports.generateEmailHtml = (fullname, login, email, password) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Добро пожаловать, ${fullname}!</h2>
        <p>Спасибо за регистрацию на нашем сервисе. Вот ваши учетные данные:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Логин:</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>${login}</b></td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Email:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">Пароль:</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>${password}</b></td>
            </tr>
        </table>
        <p style="margin-top: 20px;">Пожалуйста, сохраните эти данные в надежном месте.</p>
        <p>С уважением,<br>Команда вашего сервиса</p>
    </div>
`;
