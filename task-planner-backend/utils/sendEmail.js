const nodemailer = require('nodemailer');
const fs = require('fs');
const XLSX = require('xlsx');

exports.saveUserToExcel = (userData, filePath = 'users.xlsx') => {
    try {
        let workbook;
        let worksheet;

        // Проверяем, существует ли файл
        if (fs.existsSync(filePath)) {
            // Если файл существует, загружаем его
            workbook = XLSX.readFile(filePath);
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
        } else {
            // Если файла нет, создаем новую книгу
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.json_to_sheet([]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        }

        // Преобразуем данные пользователя в формат для Excel
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        sheetData.push(userData);

        // Обновляем данные на листе
        const updatedWorksheet = XLSX.utils.json_to_sheet(sheetData);
        workbook.Sheets['Users'] = updatedWorksheet;

        // Сохраняем файл
        XLSX.writeFile(workbook, filePath);
        console.log('Данные пользователя сохранены в Excel');
    } catch (error) {
        console.error('Ошибка при сохранении данных в Excel:', error);
    }
};

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

exports.resendCredentials = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const { fullname, email, login, password } = user;

        if (!email) {
            return res
                .status(400)
                .json({ message: 'У пользователя нет email для отправки' });
        }

        await sendEmailToHTML(
            email,
            'Ваши учетные данные',
            generateEmailHtml(fullname, login, email, password)
        );

        res.status(200).json({ message: 'Учетные данные отправлены успешно' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
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
