import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: number, parentId?: number) => void;
  onEditTask: (id: number, content: string, parentId?: number) => void;
  onAddSubtask: (parentId: number, content: string, insertAfter?: number) => void;
  onReorderTasks: (taskId: number, direction: 'up' | 'down') => void;
  onToggleCompletion: (id: number, parentId?: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onDeleteTask,
  onEditTask,
  onAddSubtask,
  onReorderTasks,
  onToggleCompletion,
}) => {
  return (
    <ul className="space-y-4 relative">
      {tasks.map((task, index) => (
        <li key={task.id} className="transform transition-transform duration-200 ease-in-out">
          <TaskItem
            task={task}
            parentTask={task} // Pass the main task as parent for its subtasks
            index={index}
            isFirst={index === 0}
            isLast={index === tasks.length - 1}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            onAddSubtask={onAddSubtask}
            onReorderTasks={onReorderTasks}
            onToggleCompletion={onToggleCompletion}
          />
        </li>
      ))}
    </ul>
  );
};

export default TaskList;