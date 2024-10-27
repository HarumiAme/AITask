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

const generarCompletado = async (sistemaPrompt, usuarioPrompt) => {
  const respuesta = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Change made here
    messages: [
      { role: 'system', content: sistemaPrompt },
      { role: 'user', content: usuarioPrompt }
    ],
    max_tokens: 100,
    temperature: 0.7,
  });

  return respuesta.choices[0]?.message?.content?.trim() ?? 'Error al generar la tarea';
};

// Generar tarea principal
app.post('/api/generate-main-task', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const sistemaPrompt = `Eres un asistente de IA para la gestión de tareas especializado en crear tareas principales.
Tu papel es:
1. Crear tareas claras y de alto nivel que puedan ser desglosadas
2. Asegurarte de que las tareas sean accionables y medibles
3. Mantener las tareas lo suficientemente amplias para tener subtareas, pero específicas para ser alcanzables
4. Utilizar un lenguaje claro y profesional
5. Enfocarte en un objetivo principal por tarea`;

    const usuarioPrompt = `Crea UNA tarea principal basada en este contexto: ${prompt}

La tarea debe ser:
- Lo suficientemente amplia como para ser desglosada en subtareas
- Lo suficientemente específica para tener un objetivo claro
- Escrita en un formato claro y accionable

Responde SOLAMENTE con el texto de la tarea, sin explicaciones ni formateo adicional.`;

    const tareaGenerada = await generarCompletado(sistemaPrompt, usuarioPrompt);
    res.json({ tarea: tareaGenerada });
  } catch (error) {
    console.error('Error al generar la tarea principal:', error.message || error);
    res.status(500).json({ error: 'Error al generar la tarea principal' });
  }
});

// Generar primera subtarea
app.post('/api/generate-first-subtask', async (req, res) => {
  try {
    const { mainTask } = req.body;
    
    const sistemaPrompt = `Eres un asistente de IA para la gestión de tareas especializado en crear subtareas iniciales.
Tu papel es:
1. Crear el primer paso lógico hacia la finalización de la tarea principal
2. Asegurarte de que la subtarea sea específica y accionable de inmediato
3. Enfocarte en empezar con la tarea principal
4. Mantener el alcance pequeño y manejable
5. Crear una base para subtareas posteriores`;

    const usuarioPrompt = `Tarea Principal: ${mainTask}

Crea la PRIMERA subtarea que debe completarse para esta tarea principal.
Esto debe ser:
- El primer paso lógico
- Accionable de inmediato
- Específica y clara
- Una base para futuras subtareas

Responde SOLAMENTE con el texto de la subtarea; no incluyas etiquetas, explicaciones ni formateo adicional.`;

    const tareaGenerada = await generarCompletado(sistemaPrompt, usuarioPrompt);
    res.json({ tarea: tareaGenerada });
  } catch (error) {
    console.error('Error al generar la primera subtarea:', error.message || error);
    res.status(500).json({ error: 'Error al generar la primera subtarea' });
  }
});

// Generar subtarea subsiguiente
app.post('/api/generate-subtask', async (req, res) => {
  try {
    const { mainTask, existingSubtasks, parentSubtask } = req.body;
    
    const sistemaPrompt = `Eres un asistente de IA para la gestión de tareas especializado en crear subtareas secuenciales.
Tu papel es:
1. Crear la siguiente subtarea lógica en la secuencia
2. Asegurarte de la continuidad con las subtareas existentes
3. Mantener la tarea específica y accionable
4. Mantener el enfoque en el objetivo de la tarea principal
5. Considerar el contexto de la subtarea principal y las subtareas hermanas`;

    const usuarioPrompt = `Tarea Principal: ${mainTask}
Subtarea Principal: ${parentSubtask}
Subtareas Existentes: ${existingSubtasks.join(', ')}

Crea la siguiente subtarea lógica que:
- Siga naturalmente de la subtarea principal
- No duplique subtareas existentes
- Se acerque a la finalización de la tarea principal
- Sea específica y accionable de inmediato

Responde SOLAMENTE con el texto de la subtarea; no incluyas etiquetas, explicaciones ni formateo adicional.`;

    const tareaGenerada = await generarCompletado(sistemaPrompt, usuarioPrompt);
    res.json({ tarea: tareaGenerada });
  } catch (error) {
    console.error('Error al generar la subtarea:', error.message || error);
    res.status(500).json({ error: 'Error al generar la subtarea' });
  }
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});