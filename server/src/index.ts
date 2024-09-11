import { createServer } from 'node:http';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes';
import { setupSocketIO } from './socket';

dotenv.config();

export const app: Express = express();
export const httpServer = createServer(app);

setupSocketIO(httpServer, app);

app.use(cors());
app.use(morgan('dev'));

app.use(router);


const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
