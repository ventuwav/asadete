import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const ChatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string(),
  })).optional().default([]),
});

const SYSTEM_PROMPT = `Sos el asistente virtual de Asadete, una app argentina para organizar y dividir los gastos de un asado entre amigos.

Cómo funciona Asadete:
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

Respondé siempre en español rioplatense, de manera amigable y concisa. Si te preguntan algo que no tiene que ver con Asadete, redirigí amablemente la conversación al uso de la app.`;

router.post('/', async (req, res, next) => {
  try {
    const { message, history } = ChatSchema.parse(req.body);

    const contents = [
      ...history.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      throw new Error((err as any).error?.message || 'Gemini API error');
    }

    const data = await geminiRes.json();
    const text: string =
      (data as any).candidates?.[0]?.content?.parts?.[0]?.text ||
      'No pude generar una respuesta.';

    res.json({ response: text });
  } catch (err) {
    next(err);
  }
});

export default router;
