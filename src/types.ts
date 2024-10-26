export interface Task {
  id: number;
  content: string;
  subtasks: Task[];
  completed?: boolean;
  gradientIndex?: number;
}