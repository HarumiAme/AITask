import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

app.post('/api/generate-task', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful task management assistant. Generate clear, concise, and actionable tasks.',
        },
        {
          role: 'user',
          content: `Generate a task based on the following context: ${prompt}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const generatedTask = response.choices[0]?.message?.content?.trim() ?? 'Failed to generate task';
    res.json({ task: generatedTask });
  } catch (error) {
    console.error('Error generating task:', error);
    res.status(500).json({ error: 'Failed to generate task' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});