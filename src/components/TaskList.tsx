import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: number, parentId?: number) => void;
  onEditTask: (id: number, content: string, parentId?: number) => void;
  onAddSubtask: (parentId: number, content: string) => void;
  onReorderTasks: (taskId: number, direction: 'up' | 'down') => void;
  onGenerateSubtask: (parentId: number, context: string) => Promise<void>;
  onToggleCompletion: (id: number, parentId?: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onDeleteTask,
  onEditTask,
  onAddSubtask,
  onReorderTasks,
  onGenerateSubtask,
  onToggleCompletion,
}) => {
  return (
    <ul className="space-y-4 relative">
      {tasks.map((task, index) => (
        <li key={task.id} className="transform transition-transform duration-200 ease-in-out">
          <TaskItem
            task={task}
            index={index}
            isFirst={index === 0}
            isLast={index === tasks.length - 1}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            onAddSubtask={onAddSubtask}
            onReorderTasks={onReorderTasks}
            onGenerateSubtask={onGenerateSubtask}
            onToggleCompletion={onToggleCompletion}
          />
        </li>
      ))}
    </ul>
  );
};

export default TaskList;