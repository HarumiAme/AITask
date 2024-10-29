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
              model: 'gpt-4o-mini',
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
              const systemPrompt = `Eres un asistente de gestión de tareas especializado en crear tareas principales.
Tu rol es:
1. Crear tareas claras y de alto nivel que puedan desglosarse
2. Asegurarte de que las tareas sean accionables y medibles
3. Mantener las tareas lo suficientemente amplias como para tener subtareas, pero lo suficientemente específicas como para ser alcanzables
4. Usar un lenguaje claro y profesional
5. Enfocarte en un objetivo principal por tarea`;

              const userPrompt = `Crea UNA tarea principal basada en este contexto: ${prompt}

La tarea debe ser:
- Lo suficientemente amplia para desglosarse en subtareas
- Lo suficientemente específica como para tener un objetivo claro
- Escrita en un formato claro y accionable

Responde SOLO con el texto de la tarea, sin explicaciones ni formato adicional.`;

              const generatedTask = await generateCompletion(systemPrompt, userPrompt);
              response = { tarea: generatedTask };
              break;
            }

            case '/generate-first-subtask': {
              const { mainTask } = data;
              const systemPrompt = `Eres un asistente de gestión de tareas especializado en crear subtareas iniciales.
Tu rol es:
1. Crear el primer paso lógico hacia la finalización de la tarea principal
2. Asegurarte de que la subtarea sea específica e inmediatamente accionable
3. Enfocarte en comenzar la tarea principal
4. Mantener el alcance pequeño y manejable
5. Crear una base para subtareas posteriores`;

              const userPrompt = `Tarea Principal: ${mainTask}

Crea la PRIMERA subtarea que debería completarse para esta tarea principal.
Esta subtarea debe ser:
- El primer paso lógico
- Inmediatamente accionable
- Específica y clara
- Una base para futuras subtareas

Responde SOLO con el texto de la subtarea; no incluyas etiquetas, explicaciones ni formato adicional.`;

              const generatedTask = await generateCompletion(systemPrompt, userPrompt);
              response = { tarea: generatedTask };
              break;
            }

            case '/generate-subtask': {
              const { mainTask, existingSubtasks, parentSubtask } = data;
              const systemPrompt = `Eres un asistente de gestión de tareas especializado en crear subtareas secuenciales.
Tu rol es:
1. Crear la siguiente subtarea lógica en la secuencia
2. Asegurar la continuidad con las subtareas existentes
3. Mantener la tarea específica y accionable
4. Mantener el enfoque en el objetivo de la tarea principal
5. Considerar el contexto de la subtarea principal y sus subtareas relacionadas`;

              const userPrompt = `Tarea Principal: ${mainTask}
Subtarea Principal: ${parentSubtask}
Subtareas Existentes: ${existingSubtasks.join(', ')}

Crea la siguiente subtarea lógica que:
- Siga de manera natural la subtarea principal
- No duplique las subtareas existentes
- Acerque más a la finalización de la tarea principal
- Sea específica e inmediatamente accionable

Responde SOLO con el texto de la subtarea; no incluyas etiquetas, explicaciones ni formato adicional.`;

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