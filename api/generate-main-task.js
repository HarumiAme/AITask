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
    const { prompt } = req.body;

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
    res.json({ tarea: generatedTask });
  } catch (error) {
    console.error('Error generating main task:', error.message || error);
    res.status(500).json({ error: 'Error generating main task' });
  }
}