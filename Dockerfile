# Utilizza l'immagine di base di node versione 20
FROM node:20

# Imposta la home directory dell'immagine, ovvero da dove vengono eseguiti tutti gli altri comandi
WORKDIR /usr/src/app

# Copia le dipendenze
COPY package*.json ./

# Dopo che ha copiato le dipendenze, npm le installa
RUN npm install

# Copia il codice sorgente nel container
COPY . .

# Serve per compilare typescript in javascript
RUN npm run build

# Espone la porta 3000 del container, consentendo al container di rispondere alle richieste su questa porta
EXPOSE 3000

# Specifica il comando di avvio del container
CMD ["npm", "start"]