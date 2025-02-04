const fs = require('fs');
const XLSX = require('xlsx');

// Сохранание пользователя в excel
exports.saveUserToExcel = (userData, filePath = 'users.xlsx') => {
    try {
        let workbook;
        let worksheet;

        if (fs.existsSync(filePath)) {
            workbook = XLSX.readFile(filePath);
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
        } else {
            workbook = XLSX.utils.book_new();
            worksheet = XLSX.utils.json_to_sheet([]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        }

        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        sheetData.push(userData);
        const updatedWorksheet = XLSX.utils.json_to_sheet(sheetData);
        workbook.Sheets['Users'] = updatedWorksheet;

        XLSX.writeFile(workbook, filePath);
        console.log('Данные пользователя сохранены в Excel');
    } catch (error) {
        console.error('Ошибка при сохранении данных в Excel:', error);
    }
};
