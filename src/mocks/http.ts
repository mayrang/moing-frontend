import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import tripRouter from './routes/trip';
import communityRouter from './routes/community';
import miscRouter from './routes/misc';

const app = express();
const port = 9090;

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(cookieParser());

// Playwright webServer health check
app.get('/', (_req, res) => res.status(200).send('ok'));

// API 라우트
app.use('/api', authRouter);
app.use('/api', tripRouter);
app.use('/api', communityRouter);
app.use('/api', miscRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ resultType: 'FAIL', success: null, error: { reason: 'Not Found' } });
});

app.listen(port, () => console.log(`Mock server is running on port: ${port}`));
