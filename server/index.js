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
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCompletion = async (systemPrompt, userPrompt) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() ?? 'Error generating task';
};

// Generate main task
app.post('/api/generate-main-task', async (req, res) => {
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
  } catch (error) {
    console.error('Error generating main task:', error.message || error);
    res.status(500).json({ error: 'Error generating main task' });
  }
});

// Generate first subtask
app.post('/api/generate-first-subtask', async (req, res) => {
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

Respond ONLY with the subtask text, no explanations or additional formatting.`;

    const generatedTask = await generateCompletion(systemPrompt, userPrompt);
    res.json({ tarea: generatedTask });
  } catch (error) {
    console.error('Error generating first subtask:', error.message || error);
    res.status(500).json({ error: 'Error generating first subtask' });
  }
});

// Generate subsequent subtask
app.post('/api/generate-subtask', async (req, res) => {
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

Respond ONLY with the subtask text, no explanations or additional formatting.`;

    const generatedTask = await generateCompletion(systemPrompt, userPrompt);
    res.json({ tarea: generatedTask });
  } catch (error) {
    console.error('Error generating subtask:', error.message || error);
    res.status(500).json({ error: 'Error generating subtask' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});