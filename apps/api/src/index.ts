import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardsRouter from './routes/boards';
import tasksRouter from './routes/tasks';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/boards', boardsRouter);
app.use('/api', tasksRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
