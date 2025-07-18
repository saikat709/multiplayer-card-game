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


const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 10;

export const NB_ROUNDS = 3;

const NB_GEMS = 3;
const CARDS_PER_PLAYER = 4;


export const GameEngineProvider = ({ children }) => {

    const [timer, setTimer ] = useMultiplayerState("timer", 0);
    const [phase, setPhase] = useMultiplayerState("phase", "lobby");
    const [round, setRound] = useMultiplayerState("round", 1);
    const [gems, setGems] = useMultiplayerState("gems", NB_GEMS);
    const [playerTurn, setPlayerTurn] = useMultiplayerState("playerTurn", 0);
    const [playerStart, setPlayerStart] = useMultiplayerState("playerStart", 0)
    const [deck, setDeck] = useMultiplayerState("deck", []);
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


    const phaseEnd = () => {

    };


    useEffect(() => {
       startGame();
       onPlayerJoin(startGame);
    });

    const { paused } = useControls({
        paused: false
    });

    const timeInterval = useRef();

    const runTimer = () => {
        timeInterval.current = setInterval(() => {
            if ( !isHost() ) return;
            if ( paused ) return;
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
    }, [phase, paused]);

    return (
        <GameEngineContext.Provider value={{
            ...gameState
        }}>
            {children}
        </GameEngineContext.Provider>
    );
}


export const useGameEngine = () => {
    const context = React.useContext(GameEngineContext);

    if (!context) {
        throw new Error("useGameEngine must be used within a GameEngineProvider");
    }

    return context;
};