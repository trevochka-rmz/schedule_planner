import API from './apiClient';

// Добавление занятия
export const addLesson = async (lessonData) => {
    const response = await API.post('/schedule/lesson', lessonData);
    return response.data;
};

// Получение расписания
export const getSchedule = async (teacherId) => {
    const response = await API.get(`/schedule?schedule=${teacherId}`);
    return response.data;
};
