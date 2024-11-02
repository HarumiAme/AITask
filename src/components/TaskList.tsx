import React from 'react';
import TaskItem from './TaskItem';
import { Task, Tag } from '../types';

interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  onDeleteTask: (id: number, parentId?: number) => void;
  onEditTask: (id: number, content: string, parentId?: number) => void;
  onUpdateTags: (id: number, tags: string[]) => void;
  onAddSubtask: (parentId: number, content: string, insertAfter?: number) => void;
  onReorderTasks: (taskId: number, direction: 'up' | 'down', parentId?: number) => void;
  onToggleCompletion: (id: number, parentId?: number) => void;
  onTaskTagClick?: (tagId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  tags,
  onDeleteTask,
  onEditTask,
  onUpdateTags,
  onAddSubtask,
  onReorderTasks,
  onToggleCompletion,
  onTaskTagClick,
}) => {
  return (
    <ul className="space-y-4 relative">
      {tasks.map((task, index) => (
        <li key={task.id} className="transform transition-transform duration-200 ease-in-out">
          <TaskItem
            task={task}
            tags={tags}
            parentTask={task}
            index={index}
            isFirst={index === 0}
            isLast={index === tasks.length - 1}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
            onUpdateTags={onUpdateTags}
            onAddSubtask={onAddSubtask}
            onReorderTasks={onReorderTasks}
            onToggleCompletion={onToggleCompletion}
            onTaskTagClick={onTaskTagClick}
          />
        </li>
      ))}
    </ul>
  );
};

export default TaskList;