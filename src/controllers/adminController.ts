import {NextFunction, Request, Response} from 'express';
import Player from '../models/Player';
import TokenFactory, {tokenErrorType} from "../factories/tokenFactory";

export const chargeTokens = async (req: Request, res: Response, next: NextFunction) => {
    const { email, tokens } = req.body;
    try {
    // Controllo dei parametri richiesti
        if (!email || !tokens) {
            //const error = TokenFactory.createError(tokenErrorType.MISSING_PARAMETERS);
            //return next(error);
            throw TokenFactory.createError(tokenErrorType.MISSING_PARAMETERS);
        }


        // Trova il giocatore in base all'email fornita
        const player = await Player.findOne({ where: { email } });

        if (!player) {
            //const error = TokenFactory.createError(tokenErrorType.USER_NOT_FOUND);
            //return next(error);
            throw TokenFactory.createError(tokenErrorType.USER_NOT_FOUND)
        }
        if (tokens > 0) {
            // Somma i nuovi token a quelli esistenti
            player.tokens += tokens;
            await player.save();

            res.status(200).json({message: 'Tokens have been updated!', currentTokens: player.tokens});
        } else {
            res.status(403).json({ message: 'You can only add tokens!' });
        }

    } catch (err) {
        //const error = TokenFactory.createError(tokenErrorType.ADMIN_AUTHORIZATION);
        next(err);
    }
};
