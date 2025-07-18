import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GameEngineProvider } from './hooks/useGameEngine.jsx'
import { insertCoin } from 'playroomkit'
import LoadingR3F from './components/LoadingR3F.jsx'


await insertCoin({
  avatars: [],
});


ReactDOM.createRoot(document.getElementById('root')).render(
  
  <React.StrictMode>
    
    <GameEngineProvider>
        <App />
        {/* <LoadingR3F /> */}
    </GameEngineProvider>
  </React.StrictMode>,

)
