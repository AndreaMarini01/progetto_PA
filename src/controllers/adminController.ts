import { Request, Response } from 'express';
import Player from '../models/Player';

export const chargeTokens = async (req: Request, res: Response) => {
    const { email, tokens } = req.body;

    // Controllo dei parametri richiesti
    if (!email || tokens === undefined) {
        return res.status(400).json({ error: 'Email e tokens sono richiesti.' });
    }

    try {
        // Trova il giocatore in base all'email fornita
        const player = await Player.findOne({ where: { email } });

        if (!player) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        // Somma i nuovi token a quelli esistenti
        player.tokens += tokens;
        await player.save();

        res.status(200).json({ message: 'Tokens aggiornati con successo.', currentTokens: player.tokens });
    } catch (err) {
        res.status(500).json({ error: 'Si è verificato un errore durante l\'aggiornamento dei tokens.' });
    }
};
