import express, { Request, Response, NextFunction } from 'express';
import Player from './models/Player';
import Game from './models/Game';
import Move from './models/Move';
import authRoutes from './routes/authRoute';
import gameRoute from "./routes/gameRoute";
import adminRoutes from './routes/adminRoute';
import errorHandler from './factories/errorHandler';
import moveRoute from "./routes/moveRoute";

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

/**
 * @route GET /
 * @description Rotta di esempio per la home dell'applicazione.
 * @access Pubblico
 *
 * Risponde con un messaggio di benvenuto.
 */
app.get('/', (req: Request, res: Response) => {
    res.send('Benvenuto nella tua applicazione Express TypeScript!');
});

/**
 * Middleware per il parsing del corpo delle richieste JSON.
 */

app.use(express.json());

/**
 * Configurazione delle rotte dell'applicazione.
 *
 * Le rotte includono autenticazione, creazione di partite, gestione amministrativa,
 * e gestione delle mosse. Ogni gruppo di rotte ha un prefisso specifico.
 */

app.use('/', authRoutes) // Rotte di autenticazione
app.use('/', gameRoute) // Rotte per la gestione di partite
app.use('/', adminRoutes); // Rotte amministrative
app.use('/create', moveRoute) // Rotte per la gestione delle mosse

/**
 * Middleware per la gestione degli errori.
 *
 * Viene utilizzato per catturare e gestire gli errori generati durante le richieste.
 */

app.use(errorHandler);

/**
 * Avvia il server Express.
 *
 * Il server è in ascolto sulla porta specificata e mostra un messaggio di conferma
 * nella console quando è attivo.
 */

app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});



