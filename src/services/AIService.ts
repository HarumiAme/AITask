import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true  // Only if absolutely necessary
});

export const AIService = {
  generateTask: async (prompt: string): Promise<string> => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful task management assistant. Generate clear, concise, and actionable tasks."
          },
          {
            role: "user",
            content: `Generate a task based on the following context: ${prompt}`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() ?? 'Failed to generate task';
    } catch (error) {
      console.error('Error generating task with OpenAI:', error);
      return 'An error occurred. Please try again.';
    }
  },
};