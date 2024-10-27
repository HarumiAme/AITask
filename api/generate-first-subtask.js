import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCompletion = async (systemPrompt, userPrompt) => {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mainTask } = req.body;

    const systemPrompt = `You are a task management AI assistant specialized in creating initial subtasks.
Your role is to:
1. Create the first logical step towards completing the main task
2. Ensure the subtask is specific and immediately actionable
3. Focus on getting started with the main task
4. Keep the scope small and manageable
5. Create a foundation for subsequent subtasks`;

    const userPrompt = `Main Task: ${mainTask}

Create the FIRST subtask that should be completed for this main task.
This should be:
- The logical first step
- Immediately actionable
- Specific and clear
- A foundation for future subtasks

Respond ONLY with the subtask text itself; do not include any labels, explanations, or additional formatting.`;

    const generatedTask = await generateCompletion(systemPrompt, userPrompt);
    res.json({ tarea: generatedTask });
  } catch (error) {
    console.error('Error generating first subtask:', error.message || error);
    res.status(500).json({ error: 'Error generating first subtask' });
  }
}