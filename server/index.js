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

app.post('/api/generar-tarea', async (req, res) => { // Keep this consistent with your front-end service
  try {
    const { prompt } = req.body;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente útil de gestión de tareas. Genera tareas claras, concisas y accionables.',
        },
        {
          role: 'user',
          content: `Genera una tarea basada en el siguiente contexto: ${prompt}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const tareaGenerada = response.choices[0]?.message?.content?.trim() ?? 'Error al generar la tarea';
    res.json({ tarea: tareaGenerada }); // Ensure this matches the front-end
  } catch (error) {
    console.error('Error generating the task:', error.message || error);
    res.status(500).json({ error: 'Error al generar la tarea' });
  }
});

app.listen(port, () => {
  console.log(`Servidor en funcionamiento en el puerto ${port}`);
});