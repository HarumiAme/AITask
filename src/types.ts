export interface Task {
  id: number;
  content: string;
  subtasks: Task[];
  completed?: boolean;
  gradientIndex?: number;
  tags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}