import { Router } from 'express';
import { z } from 'zod';
import Groq from 'groq-sdk';

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ChatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
  })).optional().default([]),
});

const SYSTEM_PROMPT = `Sos el asistente virtual de asaDeTe, una app argentina para organizar y dividir los gastos de un asado entre amigos.

Cómo funciona asaDeTe:
1. Alguien crea el evento (el asador / DT).
2. El DT comparte un link único con los participantes.
3. Cada participante se suma al evento y carga lo que gastó (ítems + montos).
4. Al terminar, el DT liquida el evento y el sistema calcula quién le debe cuánto a quién (minimizando la cantidad de transferencias).
5. Los participantes marcan los pagos como realizados. Cuando el acreedor confirma que recibió el pago, la deuda queda saldada.
6. Cuando todas las deudas están confirmadas, el evento se cierra automáticamente.

Conceptos clave:
- DT: El organizador/creador del asado. Tiene poderes de admin: puede editar cualquier participante, liquidar el evento y ver el panel de transferencias completo.
- Alias: El alias de Mercado Pago o CBU del participante, para que los demás sepan adónde transferir.
- Liquidar: El DT presiona "Liquidar" para cerrar las cuentas y calcular quién le debe a quién.
- Ítem: Cada cosa que compró un participante (ej: carne, vino, carbón).
- Consumidores de un ítem: Si un ítem tiene consumidores asignados, el costo se divide solo entre ellos. Si no tiene, se divide entre todos los participantes.
- Estado del evento: "abierto" → "liquidado" → "cerrado".

Respondé siempre en español rioplatense, de manera amigable y concisa. Si te preguntan algo que no tiene que ver con asaDeTe, redirigí amablemente la conversación al uso de la app.`;

router.post('/', async (req, res, next) => {
  try {
    const { message, history } = ChatSchema.parse(req.body);

    const messages = [
      ...history.map((m) => ({
        role: m.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant',
        content: m.text,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    const text = response.choices[0]?.message?.content
      ?? 'No pude generar una respuesta.';

    res.json({ response: text });
  } catch (err) {
    next(err);
  }
});

export default router;
