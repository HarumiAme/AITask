import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCompletion = async (systemPrompt: string, userPrompt: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() ?? 'Error generating task';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    const systemPrompt = `You are a task management AI assistant specialized in creating main tasks.
Your role is to:
1. Create clear, high-level tasks that can be broken down
2. Ensure tasks are actionable and measurable
3. Keep tasks broad enough to have subtasks, but specific enough to be achievable
4. Use clear, professional language
5. Focus on one main objective per task`;

    const userPrompt = `Create ONE main task based on this context: ${prompt}

The task should be:
- Broad enough to be broken down into subtasks
- Specific enough to have a clear goal
- Written in a clear, actionable format

Respond ONLY with the task text, no explanations or additional formatting.`;

    const generatedTask = await generateCompletion(systemPrompt, userPrompt);
    res.json({ tarea: generatedTask });
  } catch (error: any) {
    console.error('Error generating main task:', error.message || error);
    res.status(500).json({ error: 'Error generating main task' });
  }
}