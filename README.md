# Progetto Programmazione Avanzata 23/24

# Indice
1. [Obiettivo di Progetto](#obiettivo-del-progetto)
2. [Progettazione](#progettazione)
   - [Diagrammi UML](#diagrammi-uml)
     - [Diagramma dei Casi d'Uso](#diagramma-dei-casi-duso)
     - [Diagrammi delle Sequenze](#diagrammi-delle-sequenze)
3. [Diagramma ER](#digramma-er)
4. [Pattern Utilizzati](#pattern-utilizzati)
5. [Avvio del Progetto](#avvio-del-progetto)
     - [Prerequisiti](#prerequisiti)
     - [Configurazione](#configurazione)
6. [Test del Progetto](#test-del-progetto)
7. [Riconoscimenti](#riconoscimenti)


# Obiettivo di Progetto

Il progetto consiste nella realizzazione di un back-end per un sistema di gioco della dama. L'obiettivo è permettere a un utente autenticato (con JWT) di giocare partite di dama contro un altro giocatore o contro un'intelligenza artificiale (IA). Le funzionalità principali includono:

- **Gestione delle partite:** Creazione di partite contro un avversario umano o IA, con livelli di difficoltà selezionabili. Il sistema consente la gestione di più partite attive simultaneamente, limitando ogni utente a partecipare a una sola partita alla volta.
- **Timeout e abbandono:** Se un utente non esegue una mossa entro un intervallo di tempo prestabilito, la partita viene considerata abbandonata.
- **Token di pagamento:** Ogni partita richiede l'addebito di token per la creazione e per ogni mossa effettuata. Il credito dell'utente viene verificato prima dell'inizio della partita e aggiornato durante il gioco.
- **Rotte API:** Creazione di API per eseguire mosse, verificare lo stato della partita, visualizzare partite passate e lo storico delle mosse, con possibilità di esportazione in JSON o PDF.
- **Classifica giocatori:** Fornitura di una classifica pubblica che mostra il punteggio dei giocatori, con opzioni di ordinamento.
- **Certificato di vittoria:** Generazione di un certificato PDF per le partite vinte, contenente informazioni come il tempo di gioco e il numero di mosse.
- **Gestione utenti:** Implementazione di una rotta amministrativa per ricaricare i token di un utente autenticato tramite email.

Le specifiche prevedono l'utilizzo di TypeScript, JWT per l'autenticazione, un database relazionale con Sequelize, e Docker per l'avvio e la gestione dei servizi del progetto.

# Progettazione 

La progettazione del sistema di gioco della dama è stata sviluppata per garantire una struttura solida e modulare, sfruttando principi di progettazione orientata agli oggetti e best practice di architettura software. L’obiettivo principale è stato quello di creare un sistema scalabile e manutenibile, che consenta un'esperienza di gioco fluida e sicura, assicurando al contempo un facile accesso e gestione delle risorse per gli utenti. 

Di seguito viene riportata la struttura della directory:

```
.
├── Dockerfile
├── README.md
├── docker-compose.yml
├── entrypoint.sh
├── package-lock.json
├── package.json
├── src
│   ├── app.ts
│   ├── controllers
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── gameController.ts
│   │   └── moveController.ts
│   ├── db
│   │   ├── config.js
│   │   ├── database.js
│   │   ├── migrations
│   │   │   ├── 20241022103228-table_player.js
│   │   │   ├── 20241022104353-table_game.js
│   │   │   └── 20241022105609-table_move.js
│   │   └── seeders
│   │       ├── 20241022114823-seeder_player.js
│   │       ├── 20241022141815-seeder-game.js
│   │       └── 20241022141822-seeder-move.js
│   ├── express.d.ts
│   ├── factories
│   │   ├── authFactory.ts
│   │   ├── errorHandler.ts
│   │   ├── gameFactory.ts
│   │   ├── moveFactory.ts
│   │   └── tokenFactory.ts
│   ├── initialBoard.json
│   ├── middleware
│   │   ├── adminAuthMiddleware.ts
│   │   └── authMiddleware.ts
│   ├── models
│   │   ├── Game.ts
│   │   ├── Move.ts
│   │   └── Player.ts
│   ├── routes
│   │   ├── adminRoute.ts
│   │   ├── authRoute.ts
│   │   ├── gameRoute.ts
│   │   └── moveRoute.ts
│   ├── services
│   │   ├── gameService.ts
│   │   └── moveService.ts
│   └── utils
│       └── cryptoUtils.ts
├── tsconfig.json
└── wait-for-it.sh

```

Per raggiungere questo scopo, sono stati realizzati diversi diagrammi UML che illustrano i casi d’uso e il flusso delle principali operazioni, come la creazione e gestione delle partite, l’esecuzione delle mosse e la generazione dei certificati di vittoria. Inoltre, sono stati adottati design pattern specifici per risolvere problemi comuni in modo efficiente, con particolare attenzione alla separazione delle responsabilità tra le varie componenti del sistema.

Di seguito vengono descritti i principali diagrammi e pattern utilizzati, spiegandone l'implementazione e la scelta in relazione alle necessità del progetto.

## Diagrammi UML

### Diagramma dei Casi d'Uso
Il diagramma dei casi d'uso è uno strumento essenziale per illustrare le interazioni tra gli attori, ovvero gli utenti, e il sistema stesso. In questo progetto, i casi d'uso delineano le principali funzionalità che il sistema mette a disposizione degli utenti, mettendo in evidenza le azioni che possono essere eseguite all'interno del sistema di gestione delle partite di dama.

Grazie al diagramma dei casi d'uso, è possibile ottenere una panoramica generale delle operazioni disponibili per gli utenti. Sono identificati quattro attori: Utente Pubblico, Giocatore, Amministratore e AI, ognuno dei quali interagisce con il sistema attraverso funzioni specifiche. Di seguito verrà presentato il diagramma dei casi d'uso:

```mermaid
graph TD
    PublicUser["Public User"] --> playersRanking["playersRanking"]
    PublicUser --> login["login"]

    Player["Player"] --> createGame["createGame"]
    Player --> executeMove["executeMove"]
    Player --> getMoveHistory["getMoveHistory"]
    Player --> abandonGame["abandonGame"]
    Player --> evaluateGame["evaluateGame"]
    Player --> getGameDetails["getGameDetails"]
    Player --> exportToPDF["exportToPDF"]
    Player --> getVictoryCertify["getVictoryCertify"]
    Player --> getMatchList["getMatchList"]

    Admin["Admin"] --> createGame["createGame"]
    Admin --> executeMove["executeMove"]
    Admin --> getMoveHistory["getMoveHistory"]
    Admin --> abandonGame["abandonGame"]
    Admin --> evaluateGame["evaluateGame"]
    Admin --> getGameDetails["getGameDetails"]
    Admin --> exportToPDF["exportToPDF"]
    Admin --> getVictoryCertify["getVictoryCertify"]
    Admin --> getMatchList["getMatchList"]
    Admin --> RechargeUserTokens["Recharge User Tokens"]

    AI["AI"] --> executeAiMove["executeAiMove"]

    System["System"] --> GenerateJSONFile["Generate JSON File"]
    System --> GeneratePDF["exportToPDF"]
    System --> CheckForGameEnd["Check For Game End"]
    System --> VerifyMoveValidity["Verify Move Validity"]
    System --> UpdateGameStatus["Update Game Status"]
    System --> UpdatePlayerPoints["Update Player Points"]
    System --> removeCredits["removeCredits"]

    createGame --> authenticateJWT["authenticateJWT"]
    executeMove --> authenticateJWT["authenticateJWT"]
    getMoveHistory --> authenticateJWT["authenticateJWT"]
    abandonGame --> authenticateJWT["authenticateJWT"]
    evaluateGame --> authenticateJWT["authenticateJWT"]
    getGameDetails --> authenticateJWT["authenticateJWT"]
    exportToPDF --> authenticateJWT["authenticateJWT"]
    getVictoryCertify --> authenticateJWT["authenticateJWT"]
    getMatchList --> authenticateJWT["authenticateJWT"]
    RechargeUserTokens --> authenticateJWT["authenticateJWT"]

    playersRanking --> SortPlayerRankings["Sort Player Rankings"]
    exportToPDF --> FilterGamesByDate["Filter Games By Date"]
    abandonGame --> UpdatePlayerPoints
```


### Diagrammi delle Sequenze
#### POST '/login'
Il diagramma di sequenza per la rotta di login descrive il flusso di interazione tra un utente e il sistema durante il processo di autenticazione. Quando l'utente invia le proprie credenziali, il sistema verifica l'email e la password. Se le informazioni sono corrette, viene generato un token JWT, che consente all'utente di accedere alle funzionalità protette. In caso contrario, il sistema restituisce un messaggio di errore, garantendo così la sicurezza dell'applicazione. Questo diagramma evidenzia i passaggi chiave e le decisioni critiche nella gestione dell'autenticazione.

#### POST '/create/new-game'
Il diagramma di sequenza per la rotta di create game rappresenta il flusso di interazioni durante il processo di creazione di una nuova partita nel sistema di gestione delle partite. Illustra come l'utente interagisce con il middleware di autenticazione, il controller delle partite e il servizio di gioco per finalizzare la richiesta. Questo diagramma è utile per comprendere i passaggi chiave e le responsabilità di ciascun componente.

#### POST '/new-move'
Il diagramma delle sequenze per il modulo di gestione delle mosse nel gioco illustra il flusso delle interazioni tra l'utente, il middleware di autenticazione, il controller delle mosse e il servizio di movimento. Inizia con l'utente che invia una richiesta per eseguire una mossa, passando attraverso il controllo dell'autenticazione JWT. Se autenticato, il controller gestisce la richiesta e delega la logica di esecuzione della mossa al servizio di movimento. Questo diagramma è essenziale per comprendere le dinamiche di interazione e il processo di gestione delle mosse nel sistema di gioco.


# Diagramma ER
Il diagramma ER (Entity-Relationship) offre una rappresentazione visiva delle entità coinvolte nel sistema e delle loro relazioni. In questo progetto, il diagramma illustra come i modelli Player, Game e Move interagiscono tra loro. Le entità rappresentano le diverse componenti del sistema, come i giocatori e le partite, mentre le relazioni mostrano come queste entità si collegano, ad esempio, attraverso le mosse effettuate dai giocatori in una partita. Questo diagramma è utile per comprendere la struttura dei dati e la logica sottostante dell'applicazione.

```mermaid
erDiagram
    Player {
        integer player_id PK "Primary Key"
        string username "User's username"
        string email "User's email"
        string password_hash "Hashed password"
        string salt "Salt for password"
        float tokens "Player's tokens balance"
        string role "Player role (user/admin)"
        float score "Player's score"
    }

    Game {
        integer game_id PK "Primary Key"
        integer player_id FK "Foreign Key from Player"
        integer opponent_id FK "Foreign Key from Player (optional)"
        string status "Current game status"
        date created_at "Game creation date"
        date ended_at "Game end date (if applicable)"
        string type "Game type (PvP or PvE)"
        string ai_difficulty "AI difficulty level (if applicable)"
        json board "Game board configuration"
        integer total_moves "Total moves made in the game"
        integer winner_id "ID of the winner (if any)"
    }

    Move {
        integer move_id PK "Primary Key"
        integer game_id FK "Foreign Key from Game"
        integer user_id FK "Foreign Key from Player (optional)"
        date createdAt "Move creation date"
        integer move_number "Move number in the game"
        json board "Board configuration after the move"
        string from_position "Starting position of the move"
        string to_position "Ending position of the move"
        string piece_type "Type of piece moved"
    }

    Player ||--o{ Game : "has"
    Player ||--o{ Move : "makes"
    Game ||--o{ Move : "contains"
    Game ||--|| Player : "plays against"

```

# Pattern Utilizzati
Per strutturare e organizzare il progetto, sono stati adottati diversi design pattern, ciascuno con uno scopo specifico che aiuta a risolvere le sfide principali dell'applicazione, come la separazione delle responsabilità, la gestione dei dati e la modularità del codice. Di seguito sono descritti i principali pattern utilizzati:

## Model-View-Controller-Service (MVCS) 
Questo pattern estende il tradizionale modello MVC, aggiungendo un livello di servizio per gestire la logica di business. Con MVCS, i controller gestiscono esclusivamente la comunicazione tra l'interfaccia utente, non presente nel progetto in esame, e la logica del sistema, delegando ai servizi la gestione delle operazioni più complesse, rendendo il codice più modulare e facilmente manutenibile. 

- **Model:** I modelli sono implementati tramite Sequelize, un ORM per JavaScript/TypeScript, che permette di mappare le entità del database come Giocatore, Partita e Mossa. Questi modelli definiscono la struttura dei dati e le operazioni di persistenza, gestendo lo stato e l'integrazione diretta con il database. Il modello rappresenta il cuore della gestione dei dati, garantendo che la logica di accesso al database rimanga separata dalla logica di business.
- **Controller:** I controller ricevono le richieste HTTP e coordinano le operazioni tra le varie componenti, gestendo principalmente il flusso delle operazioni e smistando le richieste ai servizi nei casi più complessi. Tuttavia, non sempre è stata applicata una netta separazione tra controller e servizi: per le situazioni più semplici, abbiamo adottato un pattern MVC tradizionale, mantenendo la logica di business direttamente nei controller. Nei casi più complessi, come la gestione delle partite e delle mosse, abbiamo invece introdotto uno strato di Service per incapsulare e gestire la logica di business in modo più modulare.
- **Service:** Lo strato dei servizi è stato implementato solo dove necessario, per gestire le operazioni più complesse legate alla logica di business, come la creazione di partite, la gestione delle mosse e l’aggiornamento dei punteggi. Nei servizi viene centralizzata la logica aziendale, consentendo una separazione chiara dai controller, che restano concentrati sulla gestione delle richieste e delle risposte HTTP. Questa divisione ha permesso di semplificare il codice nelle parti più intricate dell’applicazione, mantenendo il sistema organizzato e facile da manutenere.

## Data Access Object (DAO)
Il pattern DAO (Data Access Object) è una struttura progettuale che serve a isolare la logica di accesso al database dal resto dell'applicazione. In un’applicazione organizzata secondo questo pattern, tutte le operazioni di creazione, lettura, aggiornamento e cancellazione (CRUD) sono centralizzate in un livello dedicato, costituito da classi o moduli specifici che interagiscono con il database.

## Chain of Responsibility (COR)
Il pattern Chain of Responsibility è stato implementato nel nostro progetto per gestire in modo efficace la logica di autenticazione e la gestione degli errori attraverso middleware dedicati. Ad esempio, abbiamo sviluppato un middleware di autenticazione che verifica se l'utente è autenticato tramite JWT. Se l'utente non è autenticato, il middleware interrompe il flusso della richiesta e restituisce un messaggio di errore personalizzato, impedendo l'accesso a risorse riservate. Questo approccio non solo semplifica la logica di controllo dell'accesso, ma consente di gestire in modo centralizzato la validazione dell'autenticazione. Inoltre, abbiamo implementato un middleware per la gestione degli errori, che si attiva quando viene riscontrato un errore durante l'elaborazione della richiesta. Questo middleware genera messaggi di errore personalizzati che forniscono feedback chiaro all'utente, migliorando l'esperienza utente e garantendo una gestione uniforme delle eccezioni nel sistema. In questo modo, il pattern Chain of Responsibility consente di mantenere il codice ben organizzato e facilmente manutenibile.

## Factory
La gestione degli errori è centralizzata tramite un file chiamato HerrorEndler, responsabile di lanciare gli errori in modo coerente e strutturato. Per ogni macro area (auth, game, move, e token), abbiamo creato una Factory di errori dedicata, che facilita la generazione di errori specifici per ciascun contesto applicativo.

Ogni Factory fornisce un’interfaccia unificata per la creazione degli errori HTTP personalizzati, consentendo la generazione di errori come `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN` e altri, in base alla situazione. Questo approccio ha diversi vantaggi:

- **Centralizzazione della gestione degli errori:** Il file HerrorEndler, combinato con le Factory di errore per ogni area, riduce la ripetizione del codice e semplifica la creazione di messaggi di errore personalizzati.
- **Uniformità nei codici di stato HTTP:** Utilizzando una libreria come http-status-codes, le Factory possono associare facilmente i codici HTTP appropriati agli errori, garantendo una gestione standardizzata delle eccezioni.
- **Estensibilità:** Le Factory per **auth**, **game**, **move** e **token** rendono il sistema di gestione degli errori flessibile, consentendo di aggiungere nuovi tipi di errori o modificare quelli esistenti senza intervenire in ogni singola area del codice.

# Avvio del Progetto
## Prerequisiti
- Docker
- Docker-compose

## Configurazione
1. Clonare il repository:
   
```
git clone https://github.com/AndreaMarini01/progetto_pa
cd progetto_pa
```
2. Configurare le variabili d'ambiente:
   Creare un file ```.env``` configurandolo con le seguenti variabili d'ambiente:
   
```
APP_PORT=3000
DB_USER=root
DB_PASSWORD=progetto_pa
DB_NAME=prova_pa
DB_PORT=5432
DB_HOST=db
DB_DIALECT=postgres
JWT_SECRET=my_super_secret_key
 ```
3. Posizionarsi sulla radice del progetto e lanciare da terminale il seguente comando:
   ```bash
    ./build.sh
   ```
   Il seguente file di configurazione contiene tutti comandi per l'installazione delle dipendenze e per la build (docker compose).

   NOTA: In caso si utilizzi MacOS va utilizzato prima il seguente comando: ``` chmod +x build.sh```
4. Scaricare la collection e le variabili di environment di Postman per procedere con i test.

# Test del Progetto
Se le operazioni precedenti sono state eseguite correttamente, i due container (postgres_db e express_app) saranno in esecuzione.
Nella versione attuale (DEMO version) è possibile testare l'applicativo e le relative rotte.

## Postman
È possibile testare il progetto utilizzando Postman. Forniamo una collection Postman che contiene tutte le richieste necessarie per testare le API, e le relative variabili d'ambiente. 

Importare la collection in Postman e seguire le istruzioni per testare le diverse rotte.

[Scarica la Collection Postman](./postman/PROGETTO_PA_2024.postman_collection.json)

[Scarica le variabili d'ambiente Postman](./postman/PROGETTO_PA_2024.postman_environment.json)

## Rotte

**NOTA:** Nelle rotte in cui non è specificato, è necessaria autenticazione per potervi accedere.

## Rotta di Login come utente non admin 
- **POST /login**
  
Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti, di seguito viene riportato un esempio:

```json
{
    "email":"alessio@gmail.com",
    "password":"password2"
}
```
 Se la richiesta viene effettuata correttamente viene restituito il token generato per l'utente:

  ```json
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjIsImVtYWlsIjoiYWxlc3Npb0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTczMDM3MjExNiwiZXhwIjoxNzMwMzc1NzE2fQ.jCZQAAK0778mwo_gA7h9h0a4OB_ah1D2LyCYr71x8YE"
  ```
  In caso di utente non presente nel sistema viene generato un errore con relativo status code e messaggio personalizzato:
  
  ```json
 {
     "email":"mario@gmail.com",
     "password":"password5"
 }
  ```

  ```json
     status: 401 UNAUTHORIZED
     {
       "message": "Invalid credentials provided."
     }
  ```

## Rotta di Login come utente admin
Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti, di seguito viene riportato un esempio:

```json
{
     "email":"admin@gmail.com",
    "password":"adminpassword"
 }
  ```
Se la richiesta viene effettuata correttamente viene restituito il token generato per l'utente:

   ```json
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMwMzk5NzIwLCJleHAiOjE3MzA0MDMzMjB9.pafr21-jVwoYg27WrSmPNJbNBtL21NIto5PCZgHd3Nc"
  ```
  In caso di credenziali errate viene generato un errore con relativo status code e messaggio personalizzato:
  
  ```json
 {
     "email":"luca@gmail.com",
    "password":"adminpassword"
 }
  ```

  ```json
     status: 401 UNAUTHORIZED
     {
       "message": "Invalid credentials provided."
     }
  ```


## Rotta protetta (decodeJWT)
Quando un utente non autorizzato o con un token jwt errato tenta di accedere a una rotta protetta viene restituito il seguente messaggio di errore:

 ```json
     status: 401 UNAUTHORIZED
     {   
        "message": "Unauthorized"
     }
  ```

## Rotte di gestione di una partita
- **POST /new-game**

Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti. È possibile creare una partita contro un giocatore reale (PVP) o contro l'intelligenza artificiale (PVE), dopo aver verificato che il/i giocatore/i non sono convolto/i in altre partite in corso. Di seguito viene riportato un esempio per entrambe le situazioni:

```json
{
    "opponent_email":"andrea@gmail.com"
}
```
Se la richiesta viene effettuata correttamente viene restituito il seguente messaggio:
 
```json
{
    {
    "game": {
        "created_at": "2024-10-31T11:27:39.654Z",
        "winner_id": null,
        "game_id": 4,
        "player_id": 2,
        "opponent_id": 1,
        "status": "Ongoing",
        "type": "PvP",
        "ai_difficulty": "Absent",
        "board": {
            "board": [
                [
                    null,
                    "B",
                    null,
                    "B",
                    null,
                    "B",
                    null,
                    "B"
                ],
                [
                    "B",
                    null,
                    "B",
                    null,
                    "B",
                    null,
                    "B",
                    null
                ],
                [
                    null,
                    "B",
                    null,
                    "B",
                    null,
                    "B",
                    null,
                    "B"
                ],
                [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    "W",
                    null,
                    "W",
                    null,
                    "W",
                    null,
                    "W",
                    null
                ],
                [
                    null,
                    "W",
                    null,
                    "W",
                    null,
                    "W",
                    null,
                    "W"
                ],
                [
                    "W",
                    null,
                    "W",
                    null,
                    "W",
                    null,
                    "W",
                    null
                ]
            ]
        },
        "total_moves": 0,
        "ended_at": null
    }
}
}

```

## Rotta di esecuzione di una mossa
- **POST /new-move**
  
Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti. È possibile effettuare una mossa tra quelle disponibili. Di seguito viene riportato un esempio:
```json
{
    "gameId": 6,
    "from": "A7",
    "to": "E7"
}
```

Se la richiesta viene effettuata correttamente viene restituito il seguente messaggio:

```json
{
    "message": "Move successfully executed",
    "game_id": 6,
    "moveDescription": "You moved a single from A7 to E7."
}
```

## Rotta di visualizzazione della cronologia delle mosse della partita
- **GET game/6/moves?format=json**

Un utente può controllare la cronologia delle mosse effettuate in una partita, non sono richiesti campi nel body. Di seguito viene riportato un esempio:

```json
[
    {
        "moveNumber": 1,
        "fromPosition": "A7",
        "toPosition": "E7",
        "pieceType": "single",
        "timestamp": "31/10/2024 21:50:02",
        "username": "Alessio Capriotti"
    }
]
```

Di seguito viene riportato un esempio della cronologia delle mosse eseguite in una partita in formato PDF:
[Qui un esempio di file .pdf generato](./images/Move History.pdf)


## Rotta di abbandono della partita
- **POST abandon-game/4**
  
Un utente impegnato in una partita può abbandonarla, non sono richiesti campi nel body. Di seguito viene riportato un esempio:

```json
{
    "message": "Game with ID 4 has been abandoned.",
    "game_id": 4,
    "status": "Abandoned"
}
```



## Rotta di visualizzazione delle partite completate
- **GET completed-games?startDate=2024-10-26&endDate=2024-10-30**
  
È possibile visualizzare i dati relativi alle partite completate. Di seguito viene riportato un esempio:

```json
 "data": {
        "games": [
            {
                "game_id": 1,
                "player_id": 1,
                "opponent_id": 2,
                "status": "Completed",
                "created_at": "1993-06-26T01:33:30.286Z",
                "ended_at": null,
                "type": "PvP",
                "ai_difficulty": "Absent",
                "total_moves": 0,
                "winner_id": null,
                "outcome": "Lost"
            },
            {
                "game_id": 3,
                "player_id": 2,
                "opponent_id": null,
                "status": "Completed",
                "created_at": "2006-09-14T07:37:30.137Z",
                "ended_at": "2024-10-31T18:31:41.221Z",
                "type": "PvE",
                "ai_difficulty": "Hard",
                "total_moves": 0,
                "winner_id": 2,
                "outcome": "Won"
            }
        ],
        "wins": 1,
        "losses": 1
    }
```

## Rotta di ricarica dei token
- **PUT chargeTokens**
  
L'utente autenticato come admin può ricaricare il numero di token di un utente normale. Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti. Di seguito viene riportato un esempio:

```json
{
    "email": "andrea@gmail.com",
    "tokens": "3"
}
```
Se la richiesta viene effettuata correttamente viene restituito il seguente messaggio:

```json
{
    "message": "Tokens have been updated!",
    "currentTokens": "0.33"
}
```

## Rotta di visualizzazione dello stato della partita
- **GET game-status/4**
  
È possibile visualizzare i dati relativi allo stato della partita. Di seguito viene riportato un esempio:

```json
{
    "message": "The current status of the game is: Ongoing",
    "game_id": 4,
    "board": {
        "board": [
            [
                null,
                "B",
                null,
                "B",
                null,
                "B",
                null,
                "B"
            ],
            [
                "B",
                null,
                "B",
                null,
                "B",
                null,
                "B",
                null
            ],
            [
                null,
                "B",
                null,
                "B",
                null,
                "B",
                null,
                "B"
            ],
            [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ],
            [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ],
            [
                "W",
                null,
                "W",
                null,
                "W",
                null,
                "W",
                null
            ],
            [
                null,
                "W",
                null,
                "W",
                null,
                "W",
                null,
                "W"
            ],
            [
                "W",
                null,
                "W",
                null,
                "W",
                null,
                "W",
                null
            ]
        ]
    }
}
```

## Rotta di visualizzazione della classifica
- **GET leaderboard?order=desc**
  
È possibile visualizzare la classifica degli utenti in ordine crescente e decrescente di punteggio, non è necessaria alcuna autenticazione jwt. Di seguito viene riportato un esempio:

```json
"message": "Classifica giocatori recuperata con successo.",
    "data": [
        {
            "username": "Andrea Marini",
            "score": 10
        },
        {
            "username": "Prova Prova",
            "score": 7
        },
        {
            "username": "Alessio Capriotti",
            "score": 7
        },
        {
            "username": "Admin Admin",
            "score": 2
        }
    ]
```

## Rotta di ottenimento del certificato di vittoria in PDF
- **GET win-certificate/6**
L'utente vincitore di una partita può scaricare il certificato di vittoria, non sono richiesti campi nel body. Di seguito viene riportato un esempio di file pdf:

 [Qui un esempio di file .pdf generato](./images/WinnerCertificate.pdf)

# Riconoscimenti

Andrea Marini (Matricola: 1118778)

Alessio Capriotti (Matricola: 1118918) 

Corso di Programmazione Avanzata A.A. 2023/2024 Università Politecnica delle Marche
   
