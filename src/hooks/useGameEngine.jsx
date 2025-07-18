import React from "react";

const GameEngineContext = React.createContext();


const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 10;

export const NB_ROUNDS = 3;

const NB_GEMS = 3;
const CARDS_PER_PLAYER = 4;


export const GameEngineProvider = ({ children }) => {

    return (
        <GameEngineContext.Provider value={{}}>
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