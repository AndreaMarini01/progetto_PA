#!/bin/bash

# Attende che il database sia pronto sulla porta 5432, con un timeout di 60 secondi
# Utilizza lo script wait-for-it.sh per assicurarsi che il database sia accessibile prima di continuare
./wait-for-it.sh db:5432 --timeout=60 --strict -- echo "Database è pronto"

# Esegue le migrazioni per ripristinare lo schema iniziale
npx sequelize-cli db:migrate:undo:all --config src/db/config.js --migrations-path src/db/migrations

# Esegue tutte le migrazioni per aggiornare il database allo stato più recente
npx sequelize-cli db:migrate --config src/db/config.js --migrations-path src/db/migrations

# Rimuove tutti i dati di seed precedentemente inseriti
npx sequelize-cli db:seed:undo:all --config src/db/config.js --seeders-path src/db/seeders

# Esegue tutti i seeders per inserire i dati iniziali nel database
npx sequelize-cli db:seed:all --config src/db/config.js --seeders-path src/db/seeders

# Avvia l'applicazione Node.js
npm start
