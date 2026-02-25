import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardsRouter from './routes/boards';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';
import adminRouter from './routes/admin';
import overviewRouter from './routes/overview';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/boards', boardsRouter);
app.use('/api', tasksRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/overview', overviewRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
