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
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onDeleteTask,
  onEditTask,
  onAddSubtask,
  onReorderTasks,
  onGenerateSubtask,
}) => {
  return (
    <ul className="space-y-2">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          isFirst={index === 0}
          isLast={index === tasks.length - 1}
          onDelete={onDeleteTask}
          onEdit={onEditTask}
          onAddSubtask={onAddSubtask}
          onReorderTasks={onReorderTasks}
          onGenerateSubtask={onGenerateSubtask}
        />
      ))}
    </ul>
  );
};

export default TaskList;