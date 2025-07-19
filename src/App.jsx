import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Leva } from "leva";
import { isHost } from "playroomkit";
import { UI } from "./components/UI";
import { GameEngineProvider } from "./hooks/useGameEngine";


const DEBUG = true;


// function Test() {
//   const ctx = useGameEngine();
//   console.log('Context in Test:', ctx);
//   return null;
// }

function App() {
  return (
    <>
      <Leva hidden={!DEBUG || !isHost() }/>
      <Canvas 
        shadows 
        camera={{ position: [3, 3, 3], fov: 30 }}>
        <GameEngineProvider>

        <color attach="background" args={["#ececec"]} />

        <Experience />

        </GameEngineProvider>
      </Canvas>
       <UI />
      {/* <Test /> */}
    </>
  );
}

export default App;
