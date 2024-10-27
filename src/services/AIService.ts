import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Make sure this matches the endpoint in index.js

export const AIService = {
  generateTask: async (prompt) => { // Remove TypeScript type if not using TypeScript
    try {
      const response = await axios.post(`${API_URL}/generar-tarea`, { prompt }); // Updated endpoint
      return response.data.tarea; // Updated field name
    } catch (error) {
      console.error('Error generating task:', error.message || error);
      return 'An error occurred. Please try again.';
    }
  },
};