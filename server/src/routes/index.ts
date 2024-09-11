import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Crypta Server  🤝 🌐');
});

router.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

export default router;
