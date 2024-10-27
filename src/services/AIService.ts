import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path for Vercel
  : 'http://localhost:3000/api'; // In development, use local server

export const AIService = {
  generateMainTask: async (prompt: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/generate-main-task`, { prompt });
      return response.data.tarea;
    } catch (error) {
      console.error('Error generating main task:', error.message || error);
      return 'Error generating task. Please try again.';
    }
  },

  generateFirstSubtask: async (mainTask: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/generate-first-subtask`, { mainTask });
      return response.data.tarea;
    } catch (error) {
      console.error('Error generating first subtask:', error.message || error);
      return 'Error generating subtask. Please try again.';
    }
  },

  generateSubtask: async (mainTask: string, parentSubtask: string, existingSubtasks: string[]): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/generate-subtask`, {
        mainTask,
        parentSubtask,
        existingSubtasks
      });
      return response.data.tarea;
    } catch (error) {
      console.error('Error generating subtask:', error.message || error);
      return 'Error generating subtask. Please try again.';
    }
  }
};