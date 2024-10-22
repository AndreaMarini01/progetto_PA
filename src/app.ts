import express, { Request, Response, NextFunction } from 'express';

const app = express();
const port = 3000;

// Middleware di logging semplice
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Rotta di esempio per la home
app.get('/', (req: Request, res: Response) => {
    res.send('Benvenuto nella tua applicazione Express TypeScript!');
});

// Avvio del server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});