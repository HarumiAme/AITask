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
    const { mainTask, existingSubtasks, parentSubtask } = req.body;

    const systemPrompt = `You are a task management AI assistant specialized in creating sequential subtasks.
Your role is to:
1. Create the next logical subtask in the sequence
2. Ensure continuity with existing subtasks
3. Keep the task specific and actionable
4. Maintain focus on the main task's goal
5. Consider the context of parent subtask and siblings`;

    const userPrompt = `Main Task: ${mainTask}
Parent Subtask: ${parentSubtask}
Existing Subtasks: ${existingSubtasks.join(', ')}

Create the next logical subtask that:
- Follows naturally from the parent subtask
- Doesn't duplicate existing subtasks
- Moves closer to completing the main task
- Is specific and immediately actionable

Respond ONLY with the subtask text itself; do not include any labels, explanations, or additional formatting.`;

    const generatedTask = await generateCompletion(systemPrompt, userPrompt);
    res.json({ tarea: generatedTask });
  } catch (error: any) {
    console.error('Error generating subtask:', error.message || error);
    res.status(500).json({ error: 'Error generating subtask' });
  }
}