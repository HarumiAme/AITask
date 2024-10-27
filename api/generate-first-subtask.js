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
    res.json({ tarea: generatedTask });
  } catch (error) {
    console.error('Error generating first subtask:', error.message || error);
    res.status(500).json({ error: 'Error generating first subtask' });
  }
}