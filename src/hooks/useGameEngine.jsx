// oxlint-disable no-unused-vars
import { useControls } from "leva";
import { getState, isHost, 
    onPlayerJoin, 
    useMultiplayerState, 
    usePlayersList, 
} from "playroomkit";
import React, { useEffect, useRef } from "react";
import { randInt } from "three/src/math/MathUtils";

const GameEngineContext = React.createContext();


const TIME_PHASE_CARDS = 15;
const TIME_PHASE_PLAYER_CHOICE = 15;
const TIME_PHASE_PLAYER_ACTION = 15;

export const NB_ROUNDS = 3;

const NB_GEMS = 3;
const CARDS_PER_PLAYER = 4;


export const GameEngineProvider = ({ children }) => {

    const [timer, setTimer ]                = useMultiplayerState("timer", 0);
    const [phase, setPhase]                 = useMultiplayerState("phase", "lobby");
    const [round, setRound]                 = useMultiplayerState("round", 1);
    const [gems, setGems]                   = useMultiplayerState("gems", NB_GEMS);
    const [playerTurn, setPlayerTurn]       = useMultiplayerState("playerTurn", 0);
    const [playerStart, setPlayerStart]     = useMultiplayerState("playerStart", 0)
    const [deck, setDeck]                   = useMultiplayerState("deck", []);
    const [actionSuccess, setActionSuccess] = useMultiplayerState("actionSuccess", true);


    const players = usePlayersList(true);
    players.sort((a, b) => a.id.localeCompare(b.id));

    const gameState = {
        timer,
        phase,
        round,
        gems,
        playerTurn,
        playerStart,
        players,
        deck,
        actionSuccess,
    };


    const distributeCards = (nCards) => {
        const newDeck = [...getState("deck") ];
        players.forEach((player) => {
            const cards = player.getState("cards") || [];
            for (let i = 0; i < nCards; i++) {
                if (newDeck.length > 0) {
                    const cardIndex = randInt(0, newDeck.length - 1);
                    cards.push(newDeck[cardIndex]);
                    newDeck.splice(cardIndex, 1);
                }
            }
            player.setState("cards", cards, true);
            player.setState("selectedCard", 0, true);
        });
        setDeck(newDeck, true);
    };

    const startGame = () => {
        if ( isHost() ) {
            console.log("Starting game");
            setTimer(TIME_PHASE_CARDS, true);

            const randomPlayer = randInt(0, players.length - 1);
            setPlayerStart(randomPlayer, true);
            setPlayerTurn(randomPlayer, true);
            setRound(1, true);

            setDeck([
                    ...Array.from({ length: 16 }).map(() => "punch"),
                    ...Array.from({ length: 16 }).map(() => "grab"),
                    ...Array.from({ length: 16 }).map(() => "shield")
            ], true);

            setGems(NB_GEMS, true);

            players.forEach((player) => {
                    player.setState("cards", [], true);
                    player.setState("gems", 0, true);
                    player.setState("shield", false, true);
                }
            );

            distributeCards(CARDS_PER_PLAYER);
            setPhase("cards", true);
        }
    }


    const getCard = () => {
        const player = players[getState("playerTurn")];
        
        if ( !player ) return "";
        const cards = player.getState("cards") || [];
        if ( !cards || cards.length === 0 ) return "";

        const selectedCard = player.getState("selectedCard") || 0;

        return cards[selectedCard] || "";
    }

    const removePlayerCard = () => {
        const player = players[getState("playerTurn")];
        const cards = player.getState("cards") || [];
        const selectedCard = player.getState("selectedCard") || 0;
        cards.splice(selectedCard, 1);
        player.setState("cards", cards, true);
    }

    const performPlayerAction = () => {
        const player = players[getState("playerTurn")];
        const selectedCard = player.getState("selectedCard") || 0;
        const cards = player.getState("cards") || [];
        const card = cards[selectedCard];
        
        let success = true;
        if ( card !== "shield" ) {
            player.setState("shield", false, true);
        }

        switch(card){
            case "punch":
                let target = players[getState("playerTarget")];
                if ( !target ) {
                    let targetIndex = (getState("playerTurn") + 1) % players.length;
                    player.setState("playerTarget", targetIndex, true);
                    target = players[targetIndex];
                }
                if ( target.getState("shield") ) {
                    console.log("Punch blocked by shield.");
                    success = false;
                    break;
                } 
                if ( target.getState("gems") > 0 ) {
                    target.setState("gems", target.getState("gems") - 1, true);
                    setGems(getState("gems") + 1, true);
                    console.log("Punch successful, gem stolen.");
                }
                break;
            case "grab":
                if ( getState("gems") > 0 ) {
                    player.setState("gems", player.getState("gems") + 1, true);
                    setGems(getState("gems") - 1, true);
                    console.log("Grab successful, gem taken.");
                } else {
                    console.log("Grab failed, no gems available.");
                    success = false;
                }
                break;
            case "shield":
                player.setState("shield", true, true);
                console.log("Shield activated.");
                break;
            default:
                console.log("Unknown card action: ", card);
                break
        }
        setActionSuccess(success, true);
    }


    const phaseEnd = () => {
        console.log("Phase ended: ", phase);

        let newTime = 0;

        switch( getState("phase") ) {
            case "cards":
                if ( getCard() == "punch" ){
                    setPhase("playerChoice", true);
                    newTime = TIME_PHASE_PLAYER_CHOICE;
                } else{
                    performPlayerAction();
                    setPhase("playerAction", true);
                    newTime = TIME_PHASE_PLAYER_ACTION;
                }
                break;

            case "playerChoice":
                performPlayerAction();
                setPhase("playerAction", true);
                newTime = TIME_PHASE_PLAYER_ACTION;
                break;

            case "playerAction":
                removePlayerCard();
                const nextPlayerTurn = (getState("playerTurn") + 1) % players.length;
                if ( nextPlayerTurn === getState("playerStart") ) {
                    if ( getState("round") == NB_ROUNDS ){
                        console.log("Game ended.");
                        let maxGems = 0;
                        let winner = null;
                        players.forEach((player) => {
                            const gems = player.getState("gems") || 0;
                            if ( gems > maxGems ) {
                                maxGems = gems;
                                winner = player;
                            }
                        });

                        players.forEach((player) => {
                            player.setState("winner", player === winner, true);
                            player.setState("cards", [], true);
                        });
                        
                        setPhase("end", true);

                    } else {
                        const newPlayerStart = (getState("playerStart") + 1) % players.length;
                        setPlayerStart(newPlayerStart, true);
                        setRound(getState("round") + 1, true);
                        distributeCards(1);
                        setPhase("cards", true);
                        newTime = TIME_PHASE_CARDS;
                    }

                } else {
                    setPlayerTurn(nextPlayerTurn, true);
                    if ( getCard() == "punch" ){
                        setPhase("playerChoice", true);
                        newTime = TIME_PHASE_PLAYER_CHOICE;
                    }
                    else {
                        performPlayerAction();
                        setPhase("playerAction", true);
                        newTime = TIME_PHASE_PLAYER_ACTION;
                    }
                }
                break;
            
            default:
                break
        }
        setTimer(newTime, true);
    };


    useEffect(() => {
        console.log("Game engine useEffect.");
        startGame();
        onPlayerJoin(startGame);
    }, []);

    const { Paused } = useControls({
        "Paused": false
    });

    const timeInterval = useRef();

    const runTimer = () => {
        timeInterval.current = setInterval(() => {
            console.log("Puased: ", Paused);
            if ( !isHost() ) return;
            if ( Paused ) return;
            let newTime = getState("timer") - 1;

            console.log("Timer: ", newTime);
            if ( newTime < 0 ) {
                phaseEnd();
            } else {
                setTimer(newTime, true);
            }
        }, 1000);
    }

    const clearTimer = () => {
        if (timeInterval.current) {
            clearInterval(timeInterval.current);
            timeInterval.current = null;
        }
    }


    useEffect(() => {
        runTimer();
        return clearTimer
    }, [phase, Paused]);

    return (
        <GameEngineContext.Provider value={{
            ...gameState,
            getCard,
            startGame
        }}>
            {children}
        </GameEngineContext.Provider>
    );
}


export const useGameEngine = () => {
    const context = React.useContext(GameEngineContext);

    if (context === undefined) {
        throw new Error("useGameEngine must be used within a GameEngineProvider");
    }

    return context;
};