#!/bin/bash

./wait-for-it.sh db:5432 --timeout=60 --strict -- echo "Database è pronto"

# Esegui le migrazioni e i seed
npx sequelize-cli db:migrate:undo:all --config src/db/config.js --migrations-path src/db/migrations
npx sequelize-cli db:migrate --config src/db/config.js --migrations-path src/db/migrations
npx sequelize-cli db:seed:undo:all --config src/db/config.js --seeders-path src/db/seeders
npx sequelize-cli db:seed:all --config src/db/config.js --seeders-path src/db/seeders

# Avvia l'applicazione
npm start
