import express, { Request, Response, NextFunction } from 'express';
import Player from './models/Player';
import Game from './models/Game';
import Move from './models/Move';
import authRoutes from './routes/authRoutes';

const app = express();
const port = 3000;

// Inizializza i modelli
Player.initialize();
Game.initialize();
Move.initialize();

// Configura le associazioni
Player.associate();
Game.associate();
Move.associate();

// Middleware di logging semplice
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Rotta di esempio per la home
app.get('/', (req: Request, res: Response) => {
    res.send('Benvenuto nella tua applicazione Express TypeScript!');
});

app.use(express.json()); // Questo middleware è necessario per il parsing del corpo delle richieste JSON
app.use('/auth', authRoutes);

// Avvio del server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});

