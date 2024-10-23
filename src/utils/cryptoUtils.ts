import crypto from 'crypto';

export const verifyPassword = (password: string, hash: string, salt: string) => {
    const hashToCompare = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return hash === hashToCompare;
};

