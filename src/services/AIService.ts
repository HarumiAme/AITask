import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const AIService = {
  generateTask: async (prompt: string): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/v1/generate`, {
        prompt: `Generate a task based on the following context: ${prompt}`,
        max_context_length: 2048,
        max_length: 200,
        temperature: 0.7,
        top_p: 0.9,
      });

      return response.data.results[0].text.trim();
    } catch (error) {
      console.error('Error generating task with AI:', error);
      return 'Failed to generate task';
    }
  },
};