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

Il progetto consiste nella realizzazione di un back-end per un sistema di gioco della dama. L'obiettivo è permettere a un utente autenticato (con JWT) di giocare partite di dama contro un altro giocatore o contro un'intelligenza artificiale (IA). Le funzionalità principali dell'applicazione includono:

- **Creazione delle partite:** Creazione di partite contro un avversario umano o IA, con livelli di difficoltà selezionabili. Il sistema consente la gestione di più partite attive simultaneamente, limitando ogni utente a partecipare a una sola partita alla volta.
- **Timeout e abbandono:** Se un utente non esegue una mossa entro un intervallo di tempo prestabilito, la partita viene considerata abbandonata per timeout. Inoltre, la partita può essere volontariamente abbandonata.
- **Token di pagamento:** Ogni partita richiede l'addebito di token per la creazione e per ogni mossa effettuata. Il credito dell'utente viene verificato prima dell'inizio della partita e aggiornato durante il gioco.
- **Rotte API:** Creazione di API per eseguire mosse, verificare lo stato della partita, visualizzare partite passate e lo storico delle mosse, con possibilità di esportazione in formato JSON o PDF.
- **Classifica giocatori:** Fornitura di una classifica pubblica che mostra il punteggio dei giocatori, con opzioni di ordinamento.
- **Certificato di vittoria:** Generazione di un certificato PDF per le partite vinte, contenente informazioni come il nome del vincitore, il tempo di gioco e il numero di mosse.
- **Gestione utenti:** Implementazione di una rotta amministrativa per ricaricare i token di un utente, tramite email.

Alcune delle funzionalità presenti nell'applicazione, come l'inizializzazione della board di gioco e l'implementazione dei livelli di difficoltà dell'IA, utilizzano la libreria [rapid-draughts](https://github.com/loks0n/rapid-draughts.git).

Le specifiche prevedono la realizzazione di un'applicazione Node.js utilizzando TypeScript e il framework Express, con JWT per l'autenticazione, un database relazionale gestito tramite Sequelize, e Docker per l'avvio e la gestione dei servizi del progetto. Dato che l'RDBMS da utilizzare era a discrezione degli studenti,
abbiamo deciso di utilizzare Postgres.

# Progettazione 

La progettazione del sistema di gioco della dama è stata sviluppata per garantire una struttura solida e modulare, sfruttando principi di progettazione orientata agli oggetti e best practice di architettura software. L’obiettivo principale è stato quello di creare un sistema scalabile e manutenibile, assicurando al contempo un facile accesso e gestione delle risorse per gli utenti. 

Di seguito viene riportata la struttura della directory:

```
progetto_pa/
├── images/
├── postman-collections/
├── src/
│   ├── controllers/
│   ├── db/
│   ├── factories/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.ts
│   ├── express.d.ts
│   └── initialBoard.json
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── entrypoint.sh
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── wait-for-it.sh

```

Per raggiungere questo scopo, sono stati realizzati diversi diagrammi UML che illustrano i casi d’uso e il flusso delle principali operazioni, come la creazione e gestione delle partite, l’esecuzione delle mosse e la generazione dei certificati di vittoria. Inoltre, sono stati adottati design pattern specifici per risolvere problemi comuni in modo efficiente, con particolare attenzione alla separazione delle responsabilità tra le varie componenti del sistema.

Di seguito vengono descritti i principali diagrammi e pattern utilizzati, spiegandone l'implementazione e la scelta in relazione alle necessità del progetto.

## Diagrammi UML

### Diagramma dei Casi d'Uso
Il diagramma dei casi d'uso è uno strumento essenziale per illustrare le interazioni tra gli attori, ovvero gli utenti, e il sistema stesso. In questo progetto, i casi d'uso delineano le principali funzionalità che il sistema mette a disposizione degli utenti, evidenziando le azioni che possono essere eseguite all'interno del sistema di gestione delle partite di dama.

Grazie al diagramma dei casi d'uso, è possibile ottenere una panoramica generale delle operazioni disponibili per gli utenti. Sono identificati quattro attori: Utente Pubblico, Giocatore, Amministratore e IA, ognuno dei quali interagisce con il sistema attraverso funzioni specifiche. Di seguito verrà presentato il diagramma dei casi d'uso:

```mermaid
graph TD
    PublicUser["Public User"] --> getPlayerLeaderboard["getPlayerLeaderboard"]
    PublicUser --> login["login"]

    AI["AI"] --> chooseAIMove["chooseAIMove"]

    Player["Player"] --> createGame["createGame"]
    Player --> executeMove["executeMove"]
    Player --> getMoveHistory["getMoveHistory"]
    Player --> abandonGame["abandonGame"]
    Player --> evaluateGameStatus["evaluateGameStatus"]
    Player --> getCompletedGames["getCompletedGames"]
    Player --> getVictoryCertificate["getVictoryCertificate"]

    Admin["Admin"] --> createGame["createGame"]
    Admin --> executeMove["executeMove"]
    Admin --> getMoveHistory["getMoveHistory"]
    Admin --> abandonGame["abandonGame"]
    Admin --> evaluateGameStatus["evaluateGameStatus"]
    Admin --> getCompletedGames["getCompletedGames"]
    Admin --> getVictoryCertificate["getVictoryCertificate"]
    Admin --> RechargeUserTokens["Recharge User Tokens"]

    System["System"] --> GenerateJSONFile["Generate JSON File"]
    System --> GeneratePDF["GeneratePDF"]
    System --> HandleGameOver["HandleGameOver"]
    System --> VerifyMoveValidity["VerifyMoveValidity"]
    System --> UpdateGameStatus["UpdateGameStatus"]
    System --> UpdatePlayerPoints["UpdatePlayerPoints"]
    System --> RemoveCredits["RemoveCredits"]

    createGame --> authenticationWithJWT["authenticationWithJWT"]
    executeMove --> authenticationWithJWT["authenticationWithJWT"]
    getMoveHistory --> authenticationWithJWT["authenticationWithJWT"]
    abandonGame --> authenticationWithJWT["authenticationWithJWT"]
    evaluateGameStatus --> authenticationWithJWT["authenticationWithJWT"]
    getCompletedGames --> authenticationWithJWT["authenticationWithJWT"]
    getVictoryCertificate --> authenticationWithJWT["authenticationWithJWT"]
    RechargeUserTokens --> authenticationWithJWT["authenticationWithJWT"]
    RechargeUserTokens --> adminAuthMiddleware["adminAuthMiddleware"]

    getPlayerLeaderboard --> SortPlayerRankings["SortPlayerRankings"]
    GeneratePDF --> FilterGamesByDate["FilterGamesByDate"]
    abandonGame --> UpdatePlayerScore
```
### Diagrammi delle Sequenze

#### POST '/login'

Il diagramma di sequenza per la rotta di login descrive il flusso di interazione tra un utente e il sistema durante il processo di autenticazione. Quando l'utente invia le proprie credenziali, il sistema verifica l'email e la password. Se le informazioni sono corrette, viene generato un token JWT, che consente all'utente di accedere alle funzionalità protette. In caso contrario, il sistema restituisce un messaggio di errore, garantendo così la sicurezza dell'applicazione. Questo diagramma evidenzia i passaggi chiave e le decisioni critiche nella gestione dell'autenticazione.

```mermaid
sequenceDiagram
    participant Client
    participant AuthRoute as authRoute
    participant AuthController as authController
    participant PlayerModel as Player
    participant AuthFactory as authFactory
    participant JWT as authMiddleware
    participant ErrorHandler as errorHandler

    Client->>AuthRoute: POST /login { email, password }
    AuthRoute->>AuthController: login(req, res, next)

    alt Email o password assenti
        AuthController->>AuthFactory: createError(INVALID_CREDENTIALS)
        AuthFactory-->>AuthController: AuthError("Invalid credentials provided.")
        AuthController->>ErrorHandler: next(AuthError)
        ErrorHandler-->>Client: 401 Unauthorized { error: "Invalid credentials provided." }
    else Email non valida
        AuthController->>AuthFactory: createError(INVALID_CREDENTIALS)
        AuthFactory-->>AuthController: AuthError("Invalid credentials provided.")
        AuthController->>ErrorHandler: next(AuthError)
        ErrorHandler-->>Client: 401 Unauthorized { error: "Invalid credentials provided." }
    else Utente non trovato
        AuthController->>PlayerModel: findOne({ where: { email } })
        PlayerModel-->>AuthController: null
        AuthController->>AuthFactory: createError(INVALID_CREDENTIALS)
        AuthFactory-->>AuthController: AuthError("Invalid credentials provided.")
        AuthController->>ErrorHandler: next(AuthError)
        ErrorHandler-->>Client: 401 Unauthorized { error: "Invalid credentials provided." }
    else Password non valida
        AuthController->>PlayerModel: findOne({ where: { email } })
        PlayerModel-->>AuthController: user
        AuthController->>cryptoUtils: verifyPassword(password, user.password_hash, user.salt)
        cryptoUtils-->>AuthController: false
        AuthController->>AuthFactory: createError(INVALID_CREDENTIALS)
        AuthFactory-->>AuthController: AuthError("Invalid credentials provided.")
        AuthController->>ErrorHandler: next(AuthError)
        ErrorHandler-->>Client: 401 Unauthorized { error: "Invalid credentials provided." }
    else Autenticazione riuscita
        AuthController->>PlayerModel: findOne({ where: { email } })
        PlayerModel-->>AuthController: user
        AuthController->>cryptoUtils: verifyPassword(password, user.password_hash, user.salt)
        cryptoUtils-->>AuthController: true
        AuthController->>JWT: sign({ player_id, email, role }, JWT_SECRET)
        JWT-->>AuthController: token
        AuthController-->>Client: 200 OK { token }
    end

```
### POST '/create/new-game'

Il diagramma di sequenza per la rotta di create game rappresenta il flusso di interazioni durante il processo di creazione di una nuova partita nel sistema di gestione delle partite. Illustra come l'utente interagisce con il middleware di autenticazione, il controller delle partite e il servizio di gioco per finalizzare la richiesta. Questo diagramma è utile per comprendere i passaggi chiave e le responsabilità di ciascun componente.

```mermaid
sequenceDiagram
actor Player as Player
participant AuthMiddleware as authenticationWithJWT
participant Router as gameRoute
participant Controller as gameController
participant Service as gameService
participant PlayerModel as Player
participant GameModel as Game
participant ErrorHandler as errorHandler
participant Factory as GameFactory

    Client->>AuthMiddleware: POST /create/new-game (opponent_email, ai_difficulty)
    AuthMiddleware->>AuthMiddleware: Verifica token JWT
    alt Token JWT non valido o assente
        AuthMiddleware->>ErrorHandler: next(AuthError)
        ErrorHandler->>Client: 401 Unauthorized ("Invalid or missing token")
    else Token JWT valido
        AuthMiddleware->>Router: Autenticazione valida
        Router->>Controller: createGame(req, res, next)
    end    

    Controller->>Controller: Converte email e difficoltà IA in minuscolo
    Controller->>Controller: Ottiene playerId da req.user
    alt playerId mancante
        Controller->>Factory: createError(MISSING_PLAYER_ID)
        Factory->>Controller: GameError("Missing player ID")
        Controller->>ErrorHandler: next(GameError)
        ErrorHandler->>Client: 400 Bad Request ("Missing player ID")
    end

    Controller->>PlayerModel: Trova avversario tramite opponent_email
    alt Avversario non trovato
        Controller->>Factory: createError(OPPONENT_NOT_FOUND)
        Factory->>Controller: GameError("Opponent not found")
        Controller->>ErrorHandler: next(GameError)
        ErrorHandler->>Client: 404 Not Found ("Opponent not found")
    end

    Controller->>Service: findActiveGameForPlayer(playerId, opponentId)
    alt Giocatore o avversario già in una partita
        Service->>Factory: createError(PLAYER_ALREADY_IN_GAME / OPPONENT_ALREADY_IN_GAME)
        Factory->>Service: GameError("Player or opponent already in an active game")
        Service->>Controller: GameError
        Controller->>ErrorHandler: next(GameError)
        ErrorHandler->>Client: 409 Conflict ("Player or opponent already in an active game")
    end

    Controller->>Controller: Verifica che opponent_email e ai_difficulty non siano entrambi presenti
    alt Parametri di gioco non validi
        Controller->>Factory: createError(INVALID_GAME_PARAMETERS)
        Factory->>Controller: GameError("Invalid game parameters")
        Controller->>ErrorHandler: next(GameError)
        ErrorHandler->>Client: 422 Unprocessable Entity ("Invalid game parameters")
    end

    Controller->>Controller: Determina il tipo di gioco (PvP o PvE)
    alt Difficoltà IA non valida in PvE
        Controller->>Factory: createError(INVALID_DIFFICULTY)
        Factory->>Controller: GameError("Invalid AI difficulty")
        Controller->>ErrorHandler: next(GameError)
        ErrorHandler->>Client: 400 Bad Request ("Invalid AI difficulty")
    end

    Controller->>Service: createGame(playerId, opponent_email, type, ai_difficulty, initialBoard, total_moves)
    alt Crediti insufficienti per creare la partita
        Service->>Factory: createError(INSUFFICIENT_CREDIT)
        Factory->>Service: GameError("Insufficient credit")
        Service->>Controller: GameError
        Controller->>ErrorHandler: next(GameError)
        ErrorHandler->>Client: 401 Unauthorized ("Insufficient credit")
    end

    Service->>GameModel: Crea nuova partita con i dettagli forniti
    GameModel->>Service: Nuova partita creata
    Service->>Controller: Partita creata con successo
    Controller->>Client: 201 Created (Dettagli della partita)

```

### POST '/new-move'

Il diagramma delle sequenze per il modulo di gestione delle mosse nel gioco illustra il flusso delle interazioni tra l'utente, il middleware di autenticazione, il controller delle mosse e il servizio di movimento. Inizia con l'utente che invia una richiesta per eseguire una mossa, passando attraverso il controllo dell'autenticazione JWT. Se autenticato, il controller gestisce la richiesta e delega la logica di esecuzione della mossa al servizio di movimento. Questo diagramma è essenziale per comprendere le dinamiche di interazione e il processo di gestione delle mosse nel sistema di gioco.

```mermaid
sequenceDiagram
    actor Player as Player
    participant JWTAuth as authenticationWithJWT
    participant MoveRoute as moveRoutes
    participant moveController as moveController
    participant MoveService as moveService
    participant Game as Game
    participant Move as Move
    participant Player as Player

    Client->>JWTAuth: POST /new-move
    JWTAuth->>JWTAuth: Verifica token JWT
    alt Token JWT non valido o assente
        JWTAuth-->>Client: 401 Unauthorized (Invalid or missing token)
    else Token JWT valido
        JWTAuth->>MoveRoute: Autenticazione valida
        MoveRoute->>moveController: executeMove()
        moveController->>MoveService: executeMove(gameId, from, to, playerId)

        alt Missing Parameters
            MoveService->>MoveFactory: createError(MISSING_PARAMS)
            MoveFactory-->>MoveService: MoveError("You have to specify the game id, from and to!")
            MoveService-->>moveController: 400 Bad Request
            moveController-->>Client: 400 Bad Request
        end

        MoveService->>Game: findByPk(gameId)
        alt Game Not Found
            MoveService->>MoveFactory: createError(GAME_NOT_FOUND)
            MoveFactory-->>MoveService: MoveError("The game doesn’t exist!")
            MoveService-->>moveController: 404 Not Found
            moveController-->>Client: 404 Not Found
        end

        Game-->>MoveService: Game data

        alt Game Not Ongoing
            MoveService->>GameFactory: createError(GAME_NOT_IN_PROGRESS)
            GameFactory-->>MoveService: GameError("The game is not more available.")
            MoveService-->>moveController: 409 Conflict
            moveController-->>Client: 409 Conflict
        end

        MoveService->>Player: findByPk(playerId)
        alt Player Not Authorized
            MoveService->>AuthFactory: createError(UNAUTHORIZED)
            AuthFactory-->>MoveService: AuthError("You are not authorized to perform this action.")
            MoveService-->>moveController: 403 Forbidden
            moveController-->>Client: 403 Forbidden
        end

        MoveService->>Move: findOne(last move details)
        alt Timeout or Duplicate Move
            MoveService->>MoveFactory: createError(NOT_VALID_MOVE)
            MoveFactory-->>MoveService: MoveError("The move is not valid!")
            MoveService-->>moveController: 422 Unprocessable Entity
            moveController-->>Client: 422 Unprocessable Entity
        end

        MoveService->>Game: parse and validate board
        alt Failed Parsing or Invalid Board
            MoveService->>MoveFactory: createError(FAILED_PARSING or NOT_VALID_ARRAY)
            MoveFactory-->>MoveService: MoveError("The parsing of the board has failed" or "The board's conversion is not valid!")
            MoveService-->>moveController: 400 Bad Request
            moveController-->>Client: 400 Bad Request
        end

        MoveService->>Draughts: setup board and execute move
        Draughts-->>MoveService: Updated board and valid moves

        alt No Valid Move
            MoveService->>MoveFactory: createError(NOT_VALID_MOVE)
            MoveFactory-->>MoveService: MoveError("The move is not valid!")
            MoveService-->>moveController: 422 Unprocessable Entity
            moveController-->>Client: 422 Unprocessable Entity
        end

        MoveService->>Move: create(new move entry)
        Move-->>MoveService: Move saved

        MoveService->>Game: Update board and total_moves
        MoveService-->>moveController: Move execution result
        moveController-->>Client: 200 OK, move result
    end

```

### GET /game/:gameId/moves?format={json, pdf}

Il diagramma di sequenze per la rotta MovesHistory mostra il processo di recupero della cronologia delle mosse per una partita specifica. Il client, autenticato tramite token JWT, invia una richiesta GET al server. Il server risponde con l'elenco delle mosse effettuate, permettendo al client di visualizzare la cronologia completa delle mosse per quella partita.

```mermaid
sequenceDiagram
    actor Player as Player
    participant authMiddleware as authenticationWithJWT
    participant Router
    participant Controller
    participant Service
    participant GameModel
    participant MoveModel
    participant PlayerModel
    participant ErrorHandler

    Client->>authMiddleware: GET /game/:gameId/moves
    authMiddleware->>authMiddleware: Verifica token JWT
    alt Token JWT non valido o assente
        authMiddleware->>ErrorHandler: throw AuthError("Invalid or missing token")
        ErrorHandler-->>Client: 401 Unauthorized { error: "Invalid or missing token." }
    else Token JWT valido
        authMiddleware->>Router: Autenticazione valida
        Router->>Controller: getMoveHistory(req, res, next)
        Controller->>GameModel: findByPk(gameId)

        alt Game Not Found
            GameModel-->>Controller: null
            Controller->>ErrorHandler: throw GameFactory.createError(GAME_NOT_FOUND)
            ErrorHandler-->>Client: 404 Not Found { error: "Game not found." }
        else Game Exists
            GameModel-->>Controller: game data
            Controller->>Service: exportMoveHistory(gameId, format)
            Service->>MoveModel: findAll({ game_id: gameId })
            alt No Moves
                MoveModel-->>Service: []
                Service->>ErrorHandler: throw MoveFactory.createError(NO_MOVES)
                ErrorHandler-->>Client: 404 Not Found { error: "No moves for this game." }
            else Moves Exist
                MoveModel-->>Service: moves data
                Service->>PlayerModel: findAll(player_ids)
                PlayerModel-->>Service: player data
                alt JSON Format
                    Service-->>Controller: moves in JSON format
                    Controller-->>Client: 200 OK { moves: [...] }
                else PDF Format
                    Service-->>Controller: moves as PDF Buffer
                    Controller-->>Client: PDF file
                else Invalid Format
                    Service->>ErrorHandler: throw MoveFactory.createError(INVALID_FORMAT)
                    ErrorHandler-->>Client: 404 Not Found { error: "Invalid format." }
                end
            end
        end
    end

```

### POST /abandon-game/:gameId

Il diagramma di sequenze per la rotta AbandonGame descrive il processo in cui un giocatore abbandona una partita. Il client, autenticato tramite token JWT, invia una richiesta POST per abbandonare una partita specifica. Il server verifica il token, cambia lo stato della partita per indicare che è stata abbandonata, e invia una conferma al client.

```mermaid
sequenceDiagram
    actor Player as Player
    participant JWTAuth as authenticationWithJWT
    participant Router as gameRoutes (abandon-game)
    participant Controller as gameController (abandonGame)
    participant Service as gameService (abandonGame)
    participant Model as Game
    participant ErrorHandler as errorHandler

    Player ->> JWTAuth: POST /abandon-game/:gameId
    JWTAuth ->> JWTAuth: Verifica token JWT
    alt Token JWT non valido o assente
        JWTAuth ->> ErrorHandler: AuthError("Invalid or missing token")
        ErrorHandler ->> Player: 401 Unauthorized (Invalid or missing token)
    else Token JWT valido
        JWTAuth ->> Router: Autenticazione valida
        Router ->> Controller: invoke abandonGame(req, res, next)

        Controller ->> Service: abandonGame(gameId, playerId)
        Service ->> Model: Game.findByPk(gameId)

        alt Partita non trovata
            Model -->> Service: null
            Service ->> ErrorHandler: GameError(gameErrorType.GAME_NOT_FOUND)
            ErrorHandler ->> Player: 404 Not Found (Game not found)

        else Giocatore non autorizzato
            Model -->> Service: Game instance
            Service ->> Model: Controlla se il player_id o opponent_id corrisponde al playerId
            alt player_id ≠ playerId e opponent_id ≠ playerId
                Service ->> ErrorHandler: AuthError(authErrorType.UNAUTHORIZED)
                ErrorHandler ->> Player: 403 Forbidden (Unauthorized)
            else Giocatore autorizzato
                alt Partita non in corso
                    Model -->> Service: Game instance (status ≠ 'ONGOING')
                    Service ->> ErrorHandler: GameError(gameErrorType.GAME_NOT_IN_PROGRESS)
                    ErrorHandler ->> Player: 409 Conflict (Game not in progress)

                else Partita abbandonata con successo
                    Model -->> Service: Game instance (status = 'ONGOING')
                    Service ->> Model: Aggiorna status = 'ABANDONED' e winner_id
                    Service ->> Model: Aggiorna ended_at = new Date()
                    Service ->> Model: Salva la partita aggiornata

                    Service ->> Model: Cerca e decrementa score per il giocatore
                    Model -->> Service: Successo nella modifica

                    Service -->> Controller: Partita aggiornata (status: ABANDONED)
                    Controller -->> Player: 200 OK {"message": "Game abandoned", "game_id": gameId, "status": "ABANDONED"}
                end
            end
        end
    end


```
### GET /completed-games?startDate={startDate}&endDate={endDate}

Il diagramma di sequenze per la rotta CompletedGames rappresenta il processo per ottenere l'elenco delle partite completate in un determinato intervallo di date. Il client invia una richiesta GET, autenticato tramite token JWT, includendo le date di inizio e di fine. Il server risponde con la lista delle partite completate nel periodo specificato.

```mermaid
sequenceDiagram
    actor Player as Player
    participant JWTAuth as authenticationWithJWT
    participant Router as gameRoutes (completed-games)
    participant Controller as gameController (getCompletedGames)
    participant Service as gameService (getCompletedGames)
    participant Model as Game
    participant ErrorHandler as errorHandler

    Player ->> JWTAuth: GET /completed-games?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    JWTAuth ->> JWTAuth: Verifica token JWT
    alt Token JWT non valido o assente
        JWTAuth ->> ErrorHandler: AuthError("Invalid or missing token")
        ErrorHandler ->> Player: 401 Unauthorized (Invalid or missing token)
    else Token JWT valido
        JWTAuth ->> Router: Autenticazione valida
        Router ->> Controller: invoke getCompletedGames(req, res, next)

        Controller ->> Service: getCompletedGames(playerId, startDate, endDate)

        alt playerId non presente (non autenticato)
            Service ->> ErrorHandler: GameError(gameErrorType.MISSING_PLAYER_ID)
            ErrorHandler ->> Player: 400 Bad Request (Player's ID is missing)

        else Data non valida
            Service ->> Service: Verifica formato startDate e endDate
            Service -->> ErrorHandler: GameError(gameErrorType.INVALID_DATE)
            ErrorHandler ->> Player: 400 Bad Request (Invalid date format)

        else Date mancanti
            Service ->> Service: Verifica che entrambe le date siano presenti
            Service -->> ErrorHandler: GameError(gameErrorType.MISSING_DATE)
            ErrorHandler ->> Player: 400 Bad Request (Missing start or end date)

        else Intervallo date non valido
            Service ->> Service: Verifica che startDate <= endDate
            Service -->> ErrorHandler: GameError(gameErrorType.INVALID_DATE_RANGE)
            ErrorHandler ->> Player: 400 Bad Request (Start date must be lower than end date)

        else Nessuna partita trovata
            Service ->> Model: Query partite completate in intervallo date
            Model -->> Service: Nessuna partita trovata
            Service -->> Controller: { message: "No matches found for the specified date range", games: [], wins: 0, losses: 0 }
            Controller -->> Player: 200 OK (Nessuna partita trovata)

        else Partite trovate
            Service ->> Model: Query partite completate in intervallo date
            Model -->> Service: Lista partite trovate
            Service -->> Controller: Lista partite con risultati (vittorie, sconfitte)
            Controller -->> Player: 200 OK (Lista partite completate)
        end
    end


```
### PUT /chargeTokens

Il diagramma di sequenze per la rotta ChargeTokens mostra il processo di ricarica dei token di un utente. Il client, già autenticato con un token JWT e con il ruolo di admin, invia una richiesta PUT con l'email dell'utente e il numero di token da aggiungere. Il server verifica il token JWT, aggiorna il credito dell'utente specificato, e restituisce una risposta con i dettagli della ricarica.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant JWTMiddleware as authenticationWithJWT
    participant AdminRoute as adminRoute (/chargeTokens)
    participant AdminAuth as adminAuthMiddleware
    participant Controller as adminController
    participant Model as Player
    participant ErrorHandler as errorHandler

    Admin->>+JWTMiddleware: PUT /chargeTokens (email, tokens)
    JWTMiddleware->>JWTMiddleware: Verifica token JWT

    alt Token mancante
        JWTMiddleware-->>ErrorHandler: AuthError (NEED_AUTHORIZATION)
        ErrorHandler-->>Admin: 401 Unauthorized
    else Token scaduto
        JWTMiddleware-->>ErrorHandler: AuthError (TOKEN_EXPIRED)
        ErrorHandler-->>Admin: 401 Unauthorized
    else Token valido
        JWTMiddleware-->>AdminRoute: Autenticazione JWT valida
        AdminRoute->>+AdminAuth: Verifica autorizzazione admin

        AdminAuth->>+Model: Trova l'utente tramite ID
        alt Utente non trovato
            AdminAuth-->>ErrorHandler: AuthError (INVALID_CREDENTIALS)
            ErrorHandler-->>Admin: 401 Unauthorized
        else Ruolo non amministrativo
            AdminAuth-->>ErrorHandler: TokenError (ADMIN_AUTHORIZATION)
            ErrorHandler-->>Admin: 403 Forbidden
        else Utente admin verificato
            AdminAuth-->>Controller: Utente admin verificato

            Controller->>+Model: Trova il giocatore tramite email
            alt Parametri mancanti (email o tokens)
                Controller-->>ErrorHandler: TokenError (MISSING_PARAMETERS)
                ErrorHandler-->>Admin: 400 Bad Request
            else Utente non trovato
                Controller-->>ErrorHandler: TokenError (USER_NOT_FOUND)
                ErrorHandler-->>Admin: 404 Not Found
            else Token negativo o zero
                Controller-->>ErrorHandler: TokenError (POSITIVE_TOKEN)
                ErrorHandler-->>Admin: 422 Unprocessable Entity
            else
                Model-->>Controller: Giocatore trovato
                Controller->>Model: Aggiunge tokens esistenti

                Model-->>Controller: Aggiornamento tokens completato
                Controller-->>Admin: 200 OK, Tokens aggiornati
            end
        end
    end


```
### GET /game-status/:gameId

Il diagramma di sequenze per la rotta GameStatus illustra il processo per ottenere lo stato attuale di una partita specifica. Il client invia una richiesta GET, autenticato tramite token JWT, e il server risponde con lo stato della partita. Questa rotta permette al client di ottenere informazioni sullo stato della partita in corso.

```mermaid
sequenceDiagram
    actor Player as Player
    participant JWTMiddleware as authenticationWithJWT
    participant GameRoute as gameRoute (/game-status/:gameId)
    participant Controller as gameController
    participant Model as Game
    participant ErrorHandler as errorHandler

    Player->>+JWTMiddleware: GET /game-status/:gameId (gameId)
    JWTMiddleware->>JWTMiddleware: Verifica autenticazione JWT

    alt Token mancante
        JWTMiddleware-->>ErrorHandler: AuthError (NEED_AUTHORIZATION)
        ErrorHandler-->>Player: 401 Unauthorized
    else Token scaduto
        JWTMiddleware-->>ErrorHandler: AuthError (TOKEN_EXPIRED)
        ErrorHandler-->>Player: 401 Unauthorized
    else Token valido
        JWTMiddleware-->>GameRoute: Autenticazione JWT valida
        GameRoute->>+Controller: Token valido, invoca gameController

        Controller->>+Model: Trova partita con gameId
        alt Partita non trovata
            Model-->>Controller: null
            Controller-->>ErrorHandler: GameError (GAME_NOT_FOUND)
            ErrorHandler-->>Player: 404 Not Found
        else Partita trovata
            Model-->>Controller: Partita trovata
            Controller-->>Player: 200 OK, Restituisce stato partita e configurazione board
        end
    end


```
### GET /leaderboard?order={desc, asc}

Il diagramma di sequenze per la rotta Ranking descrive il processo per visualizzare la classifica dei giocatori. Il client invia una richiesta GET senza necessità di autenticazione e specifica l'ordine di ordinamento (ascendente o discendente). Il server risponde con la classifica dei giocatori in base ai loro punteggi.

```mermaid
sequenceDiagram
    participant Client
    participant GameRoute as gameRoute (/leaderboard)
    participant Controller as gameController
    participant Service as gameService
    participant Model as Player
    participant ErrorHandler as errorHandler

    Client->>+GameRoute: GET /leaderboard?order=asc/desc
    GameRoute->>+Controller: Richiesta classifica con parametro 'order'

    alt Parametro non valido o errore di server
        Controller-->>ErrorHandler: Generic Error
        ErrorHandler-->>Client: 500 Internal Server Error
    end

    Controller->>+Service: Ottieni classifica giocatori (order)
    Service->>+Model: Recupera giocatori ordinati per punteggio

    alt Giocatori trovati
        Model-->>Service: Restituisce elenco giocatori ordinato
        Service-->>Controller: Elenco giocatori
        Controller-->>Client: 200 OK, Restituisce classifica
    else Nessun giocatore trovato
        Model-->>Service: []
        Service-->>Controller: Messaggio "No players found"
        Controller-->>Client: 404 Not Found, Nessun giocatore trovato
    end

```
### GET /win-certificate/:gameId

Il diagramma di sequenze per la rotta WinnerCertificate rappresenta il processo di generazione di un certificato di vittoria per una partita specifica. Il client, autenticato tramite token JWT, invia una richiesta GET al server. Il server verifica l'autenticazione, raccoglie i dettagli della vittoria (come durata della partita e nome dell'avversario), e restituisce un certificato di vittoria sotto forma di documento o file PDF.  E' importante specificare che, solo il giocatore che ha vinto, può ottenere il certificato di vittoria.

```mermaid
sequenceDiagram
    participant Player as Player
    participant JWTMiddleware as authenticationWithJWT
    participant GameRoute as gameRoute (/win-certificate/:gameId)
    participant Controller as gameController
    participant Service as gameService
    participant Model as Game
    participant PDFGenerator as PDFKit
    participant ErrorHandler as errorHandler

    Player->>+JWTMiddleware: GET /win-certificate/:gameId
    JWTMiddleware->>JWTMiddleware: Verifica token JWT

    alt Token mancante
        JWTMiddleware-->>ErrorHandler: AuthError (NEED_AUTHORIZATION)
        ErrorHandler-->>Player: 401 Unauthorized
    else Token scaduto
        JWTMiddleware-->>ErrorHandler: AuthError (TOKEN_EXPIRED)
        ErrorHandler-->>Player: 401 Unauthorized
    else Token valido
        JWTMiddleware-->>GameRoute: Autenticazione JWT valida
        GameRoute->>+Controller: Richiesta certificato vittoria per gameId

        Controller->>Service: Verifica esistenza partita con gameId
        Service->>Model: Trova partita per ID

        alt Partita non trovata
            Model-->>Service: null
            Service-->>Controller: GameError (GAME_NOT_FOUND)
            ErrorHandler-->>Player: 404 Game not found
        else Partita trovata
            Model-->>Service: Partita trovata
            Service->>+Controller: Verifica vincitore (confronto winner_id)

            alt Solo il vincitore può ottenere il certificato
                Controller-->>ErrorHandler: GameError (ONLY_WINNER)
                ErrorHandler-->>Player: 400 Only the winner can obtain the certificate
            else Partita ancora in corso
                Model-->>Service: Stato partita
                Service->>Controller: Controllo stato completato
                Controller-->>ErrorHandler: GameError (GAME_IN_PROGRESS)
                ErrorHandler-->>Player: 400 The game is still in progress
            else Partita completata e giocatore è il vincitore
                Controller->>+Service: Generazione certificato vittoria (gameId, playerId)
                Service->>+PDFGenerator: Crea PDF certificato
                PDFGenerator-->>Service: PDF Buffer
                Service-->>Controller: Certificato PDF generato

                Controller-->>Player: 200 OK, Restituisce certificato PDF
            end
        end
    end

```
# Diagramma ER
Il diagramma ER (Entity-Relationship) offre una rappresentazione visiva delle entità coinvolte nel sistema e delle loro relazioni. In questo progetto, il diagramma illustra come i modelli Player, Game e Move interagiscono tra loro. Le entità rappresentano le diverse componenti del sistema, ovvero i giocatori, le partite e le mosse, mentre le relazioni mostrano come queste entità si collegano. Questo diagramma è utile per comprendere la struttura dei dati e la logica sottostante dell'applicazione.

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
Il pattern DAO (Data Access Object) è una struttura progettuale che serve a isolare la logica di accesso al database dal resto dell'applicazione. In un’applicazione organizzata secondo questo pattern, tutte le operazioni di creazione, lettura, aggiornamento e cancellazione (CRUD) sono centralizzate in un livello dedicato, costituito da classi o moduli specifici che interagiscono con il database. È importante specificare che questo pattern è stato implementato utilizzando Sequelize, che fornisce un’interfaccia per l’accesso ai dati.

## Chain of Responsibility (COR)
Il pattern Chain of Responsibility è stato implementato nel nostro progetto per gestire in modo efficace la logica di autenticazione e la gestione degli errori attraverso middleware dedicati. Ad esempio, abbiamo sviluppato un middleware di autenticazione che verifica se l'utente è autenticato tramite JWT. Se l'utente non è autenticato, il middleware interrompe il flusso della richiesta e restituisce un messaggio di errore personalizzato, impedendo l'accesso a risorse riservate. Questo approccio non solo semplifica la logica di controllo dell'accesso, ma consente di gestire in modo centralizzato la validazione dell'autenticazione. Inoltre, abbiamo implementato un middleware per la gestione degli errori, che si attiva quando viene riscontrato un errore durante l'elaborazione della richiesta. Questo middleware genera messaggi di errore personalizzati che forniscono feedback chiaro all'utente, migliorando l'esperienza utente e garantendo una gestione uniforme delle eccezioni nel sistema.
Infine, abbiamo implementato anche un middleware che, oltre a verificare l'autenticazione dell'utente, sempre tramite JWT, controlla che l'utente abbia il ruolo di admin, riservando a quest'ultimo ulteriori funzionalità. In caso di permesso mancato, il middleware restituisce un messaggio di errore personalizzato. In questo modo, il pattern Chain of Responsibility consente di mantenere il codice ben organizzato e facilmente manutenibile.

## Factory
La gestione degli errori è centralizzata tramite un file chiamato errorHandler, responsabile di lanciare gli errori in modo coerente e strutturato. Per ogni macro area (auth, game, move e token), abbiamo creato una Factory di errori dedicata, che facilita la generazione di errori specifici per ciascun contesto applicativo.

Ogni Factory fornisce un’interfaccia unificata per la creazione degli errori HTTP personalizzati, consentendo la generazione di errori come `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN` e altri, in base alla situazione. Questo approccio ha diversi vantaggi:

- **Centralizzazione della gestione degli errori:** Il file errorHandler, combinato con le Factory di errore per ogni area, riduce la ripetizione del codice e semplifica la creazione di messaggi di errore personalizzati.
- **Uniformità nei codici di stato HTTP:** Utilizzando una libreria come http-status-codes, le Factory possono associare facilmente i codici HTTP appropriati agli errori, garantendo una gestione standardizzata delle eccezioni.
- **Estensibilità:** Le Factory per **auth**, **game**, **move** e **token** rendono il sistema di gestione degli errori flessibile, consentendo di aggiungere nuovi tipi di errori o modificare quelli esistenti senza intervenire in ogni singola area del codice.

## Singleton


Nel progetto è stato adottato il pattern Singleton per gestire la connessione al database. Durante l'inizializzazione dell'applicazione, viene creata un’unica istanza di Sequelize, responsabile di tutte le interazioni con il database. Questo approccio garantisce una connessione centralizzata e condivisa tra le diverse componenti dell’applicazione, prevenendo problemi di concorrenza e conflitti di connessione. L'uso del Singleton per la connessione al database contribuisce a migliorare l'efficienza e la coerenza nelle operazioni di lettura e scrittura sui dati.
Per implementare il pattern Singleton, è stata creata la classe Database, che memorizza l'istanza di Sequelize in una proprietà statica. Il metodo getInstance() verifica se l'istanza è già presente: in tal caso, la restituisce; altrimenti, ne crea una nuova utilizzando le variabili d'ambiente configurate. In questo modo, si assicura che tutte le richieste nell’applicazione utilizzino un'unica connessione al database, ottimizzando le risorse.

# Avvio del Progetto
## Prerequisiti
- Docker e Docker-compose installati nel sistema

## Configurazione
1. Clonare il repository:
   
```
git clone https://github.com/AndreaMarini01/progetto_pa
cd progetto_pa
```
2. Configurare le variabili d'ambiente:
   Creare un file ```.env``` configurandolo con le corrette variabili d'ambiente. Questo file deve trovarsi all’interno della directory principale del progetto.
3. Posizionarsi sulla radice del progetto e lanciare da terminale il seguente comando:
   ```bash
    docker-compose up --build
   ```
   Il seguente file di configurazione contiene tutti comandi per l'installazione delle dipendenze e per la build (docker compose).

4. Scaricare la collection e le variabili di environment di Postman per procedere con i test.

# Test del Progetto
Se le operazioni precedenti sono state eseguite correttamente, i due container (postgres_db e express_app) saranno in esecuzione.
Nella versione attuale è possibile testare l'applicativo e le relative rotte.

## Postman
È possibile testare il progetto utilizzando Postman. Forniamo una collection Postman che contiene tutte le richieste necessarie per testare le API, e le relative variabili d'ambiente. 

Importare la collection in Postman e seguire le istruzioni per testare le diverse rotte.

[Scarica la Collection Postman](./postman/PROGETTO_PA_2024.postman_collection.json)

[Scarica le variabili d'ambiente Postman](./postman/PROGETTO_PA_2024.postman_environment.json)

## Rotte

**NOTA:** Nelle rotte in cui non è specificato, è necessaria autenticazione per potervi accedere. Quando un utente non autorizzato o con un token jwt errato tenta di accedere a una rotta protetta, viene restituito un messaggio di errore apposito.

### Rotta di Login come utente non admin 
- **POST /login**
  
Per poter ottenere una risposta dalla seguente rotta è necessario riempire il body della richiesta con gli appositi campi; di seguito viene riportato un esempio:

```json
{
    "email":"alessio@gmail.com",
    "password":"password2"
}
```
 Se la richiesta viene effettuata correttamente, ovvero email e password corrispondono ad un utente, viene generato un token JWT per quell'utente:

  ```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjIsImVtYWlsIjoiYWxlc3Npb0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTczMDYyNDc0NSwiZXhwIjoxNzMwNjI4MzQ1fQ.UKmAknltBuxS4yn8Wgdcx0L-nEjQ3gzxc6JpiwhGU04"
}
  ```
  In caso di utente non presente nel sistema, viene generato un errore con relativo status code e messaggio personalizzato:
  
  ```json
 {
     "email":"mario@gmail.com",
     "password":"password5"
 }
  ```

  ```json
     {
       "error": "Invalid credentials provided."
     }
  ```

### Rotte per la creazione di una partita
- **POST /create/new-game**

Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti. È possibile creare una partita contro un giocatore reale (PVP) o contro l'intelligenza artificiale (PVE), dopo aver verificato che il/i giocatore/i non sono convolto/i in altre partite in corso. Di seguito viene riportato un esempio per entrambe le situazioni.
Questo è il caso di una partita PVP:

```json
{
    "opponent_email":"andrea@gmail.com"
}
```
Se la richiesta viene effettuata correttamente viene restituito il seguente messaggio:
 
```json
{
  "game": {
    "created_at": "2024-11-03T10:15:06+01:00",
    "ended_at": null,
    "winner_id": null,
    "game_id": 4,
    "player_id": 2,
    "opponent_id": 1,
    "status": "ongoing",
    "type": "pvp",
    "ai_difficulty": "absent",
    "board": {
      "board": [
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 1,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 2,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 3,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 4,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": true,
          "position": 5,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 6,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 7,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 8,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 9
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 10,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 11,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 12,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": true,
          "position": 13,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 14
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 15
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 16
        },
        {
          "dark": false
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 17
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 18
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 19,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 20
        },
        {
          "dark": true,
          "position": 21,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 22,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 23,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 24
        },
        {
          "dark": false
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 25,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 26,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 27,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 28,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": true,
          "position": 29,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 30,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 31,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 32,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        }
      ]
    },
    "total_moves": 0
  }
}

```

Mentre questo è il caso di una partita PVE:

```json
{
  "ai_difficulty": "Hard"
}
```

Se la richiesta viene effettuata correttamente, viene restituita la seguente risposta:

```json
{
  "game": {
    "created_at": "2024-11-03T10:19:58+01:00",
    "ended_at": null,
    "winner_id": null,
    "game_id": 5,
    "player_id": 2,
    "opponent_id": -1,
    "status": "ongoing",
    "type": "pve",
    "ai_difficulty": "hard",
    "board": {
      "board": [
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 1,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 2,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 3,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 4,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": true,
          "position": 5,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 6,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 7,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 8,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 9
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 10,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 11,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 12,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": true,
          "position": 13,
          "piece": {
            "player": "dark",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 14
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 15
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 16
        },
        {
          "dark": false
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 17
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 18
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 19,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 20
        },
        {
          "dark": true,
          "position": 21,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 22,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 23,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 24
        },
        {
          "dark": false
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 25,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 26,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 27,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 28,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": true,
          "position": 29,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 30,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 31,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        },
        {
          "dark": true,
          "position": 32,
          "piece": {
            "player": "light",
            "king": false
          }
        },
        {
          "dark": false
        }
      ]
    },
    "total_moves": 0
  }
}
```

### Rotta di esecuzione di una mossa
- **POST /new-move**
  
Per poter ottenere una risposta dalla seguente rotta è necessario riempire il campo body con i campi richiesti. È possibile effettuare una mossa tra quelle disponibili. Di seguito viene riportato un esempio:
```json
{
    "gameId": 5,
    "from": "G7",
    "to": "H6"
}
```

Nel caso di una partita PVP, se la richiesta viene effettuata correttamente, viene restituito il seguente messaggio:

```json
{
    "message": "Move successfully executed",
    "game_id": 6,
    "moveDescription": "You moved a single from A7 to E7."
}
```

Invece, nel caso di una partita PVE, vengono aggiunti anche dettagli sulla mossa dell'IA:

```json
{
  "message": "Move successfully executed",
  "game_id": 5,
  "moveDescription": "You moved a single from G7 to H6. AI moved a single from E3 to D4."
}
```

### Rotta di visualizzazione della cronologia delle mosse della partita

- **GET /game/5/moves?format=json**

Un utente può controllare la cronologia delle mosse effettuate in una partita, non sono richiesti campi nel body. Di seguito viene riportato un esempio di risposta:

```json
[
  {
    "move_number": 1,
    "from_position": "G7",
    "to_position": "H6",
    "piece_type": "single",
    "created_at": "03/11/2024 10:22:30",
    "username": "Alessio Capriotti"
  },
  {
    "move_number": 2,
    "from_position": "E3",
    "to_position": "D4",
    "piece_type": "single",
    "created_at": "03/11/2024 10:22:30",
    "username": "Artificial Intelligence"
  }
]
```
- **GET /game/5/moves?format=pdf**

Di seguito viene riportato un esempio della cronologia delle mosse eseguite in una partita in formato PDF:
[Qui un esempio di file .pdf generato](./images/MoveHistory.pdf)


### Rotta di abbandono della partita
- **POST /abandon-game/5**
  
Un utente impegnato in una partita può abbandonarla, non sono richiesti campi nel body. Di seguito viene riportato un esempio:

```json
{
    "message": "Game with ID 5 has been abandoned.",
    "game_id": 5,
    "status": "Abandoned"
}
```

### Rotta di visualizzazione delle partite completate
- **GET /completed-games?startDate=2024-10-26&endDate=2024-10-30**
  
È possibile visualizzare i dati relativi alle partite completate. Di seguito viene riportato un esempio:

```json
 {
  "data": {
    "games": [
      {
        "created_at": "2024-11-03T10:15:06+01:00",
        "ended_at": "2024-11-03T10:19:43+01:00",
        "game_id": 4,
        "player_id": 2,
        "opponent_id": 1,
        "status": "abandoned",
        "type": "pvp",
        "ai_difficulty": "absent",
        "total_moves": 0,
        "winner_id": 1,
        "outcome": "Lost"
      }
    ],
    "wins": 0,
    "losses": 1
  }
}
```

### Rotta di ricarica dei token
- **PUT /chargeTokens**
  
L'utente autenticato come admin può ricaricare il numero di token di un utente normale. Per poter ottenere una risposta dalla seguente rotta è necessario inserire nel body con i campi richiesti. Supponendo, ad esempio, che l'utente con email "andrea@gmail.com" abbia 0.3 token residui:

```json
{
  "email":"andrea@gmail.com",
  "tokens": 3
}
```
Se la richiesta viene effettuata correttamente, viene restituito il seguente messaggio:

```json
{
  "message": "Tokens have been updated!",
  "currentTokens": 3.3
}
```

### Rotta di visualizzazione dello stato della partita
- **GET /game-status/5**
  
È possibile visualizzare i dati relativi allo stato della partita. Di seguito viene riportato un esempio:

```json
{
  "message": "The current status of the game is: ongoing",
  "game_id": 5,
  "board": {
    "board": [
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 0,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 1,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 2,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 3,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": true,
        "position": 4,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 5,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 6,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 7,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 8
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 9,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 10,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 11,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": true,
        "position": 12,
        "piece": {
          "player": "dark",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 13
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 14
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 15
      },
      {
        "dark": false
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 16
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 17
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 18,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 19
      },
      {
        "dark": true,
        "position": 20,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 21,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 22,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 23
      },
      {
        "dark": false
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 24,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 25,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 26,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 27,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": true,
        "position": 28,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 29,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 30,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      },
      {
        "dark": true,
        "position": 31,
        "piece": {
          "player": "light",
          "king": false
        }
      },
      {
        "dark": false
      }
    ]
  }
}
```

### Rotta di visualizzazione della classifica
- **GET /leaderboard?order=desc**
  
È possibile visualizzare la classifica degli utenti in ordine crescente e decrescente di punteggio (attributo 'score' nel database). Non è necessaria alcuna autenticazione JWT. Di seguito vengono riportati i due esempi:

```json
{
  "message": "Classifica giocatori recuperata con successo.",
  "data": [
    {
      "username": "Andrea Marini",
      "score": 9.5
    },
    {
      "username": "Prova Prova",
      "score": 7
    },
    {
      "username": "Alessio Capriotti",
      "score": 6
    },
    {
      "username": "Admin Admin",
      "score": 2
    },
    {
      "username": "Artificial Intelligence",
      "score": 0
    }
  ]
}
```

- **GET /leaderboard?order=asc**

```json
{
  "message": "Classifica giocatori recuperata con successo.",
  "data": [
    {
      "username": "Artificial Intelligence",
      "score": 0
    },
    {
      "username": "Admin Admin",
      "score": 2
    },
    {
      "username": "Alessio Capriotti",
      "score": 6
    },
    {
      "username": "Prova Prova",
      "score": 7
    },
    {
      "username": "Andrea Marini",
      "score": 9.5
    }
  ]
}
```

### Rotta di ottenimento del certificato di vittoria in PDF
- **GET /win-certificate/4**
L'utente vincitore di una partita può scaricare il certificato di vittoria, non sono richiesti campi nel body. Di seguito viene riportato un esempio di file pdf:

 [Qui un esempio di file .pdf generato](./images/WinnerCertificate.pdf)

# Riconoscimenti

Andrea Marini (Matricola: 1118778)

Alessio Capriotti (Matricola: 1118918) 

Corso di Programmazione Avanzata A.A. 2023/2024 Università Politecnica delle Marche
   
