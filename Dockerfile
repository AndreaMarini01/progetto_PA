# Utilizza l'immagine di base di node
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

# Dice a Docker che la porta di ascolto è la 3000
EXPOSE 3000

# Comando necessario per avviare l'applicazione (equivale ad eseguire sulla shell del terminale dell'immagine "npm start")
CMD ["npm", "start"]