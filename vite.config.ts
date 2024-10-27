import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API handler for development
const apiPlugin = () => ({
  name: 'api',
  configureServer(server) {
    server.middlewares.use('/api', async (req, res, next) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      // Get the endpoint from the URL
      const endpoint = req.url?.split('?')[0];
      
      // Parse the request body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          let response;

          const generateCompletion = async (systemPrompt: string, userPrompt: string) => {
            const completion = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 100,
              temperature: 0.7,
            });
          
            return completion.choices[0]?.message?.content?.trim() ?? 'Error generating task';
          };

          switch (endpoint) {
            case '/generate-main-task': {
              const { prompt } = data;
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
              response = { tarea: generatedTask };
              break;
            }

            case '/generate-first-subtask': {
              const { mainTask } = data;
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
              response = { tarea: generatedTask };
              break;
            }

            case '/generate-subtask': {
              const { mainTask, existingSubtasks, parentSubtask } = data;
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
              response = { tarea: generatedTask };
              break;
            }

            default:
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not found' }));
              return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response));
        } catch (error) {
          console.error('API Error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), apiPlugin()],
});