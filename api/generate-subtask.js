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
    const { mainTask, existingSubtasks, parentSubtask } = req.body;

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
    res.json({ tarea: generatedTask });
  } catch (error) {
    console.error('Error generating subtask:', error.message || error);
    res.status(500).json({ error: 'Error generating subtask' });
  }
}