import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

const TaskList = ({ tasks, onUpdate, users, userId }) => {
    return (
        <div className="task-list">
            <div className="task-list-all">
                <h2>Все задачи</h2>
                {tasks.map((task) => (
                    <TaskItem
                        key={task._id}
                        task={task}
                        users={users}
                        onUpdate={onUpdate}
                        userIdTeacher={userId}
                    />
                ))}
            </div>
            <div className="task-list-pending">
                <h2>Невыполненные задачи</h2>
                {tasks
                    .filter(
                        (task) =>
                            task.status !== 'completed' &&
                            task.assignee === userId
                    )
                    .map((task) => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onUpdate={onUpdate}
                            users={users}
                            userIdTeacher={userId}
                        />
                    ))}
            </div>
            <div className="task-list-completed">
                <h2>Выполненные задачи</h2>
                {tasks
                    .filter(
                        (task) =>
                            task.status === 'completed' &&
                            task.assignee === userId
                    )
                    .map((task) => (
                        <TaskItem
                            users={users}
                            key={task._id}
                            task={task}
                            userIdTeacher={userId}
                            onUpdate={onUpdate}
                        />
                    ))}
            </div>
        </div>
    );
};

export default TaskList;
