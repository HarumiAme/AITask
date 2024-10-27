import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const AIService = {
  generateTask: async (prompt: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/generate-task`, { prompt });
      return response.data.task;
    } catch (error) {
      console.error('Error generating task:', error);
      return 'An error occurred. Please try again.';
    }
  },
};