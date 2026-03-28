import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import eventsRouter from './routes/events';
import debtsRouter from './routes/debts';
import itemsRouter from './routes/items';
import chatRouter from './routes/chat';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/events', eventsRouter);
app.use('/api/debts', debtsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/chat', chatRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
