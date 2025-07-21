import { Environment, OrbitControls } from "@react-three/drei";
import { Card } from "./Card";
import { Character } from "./Character";
import { UI } from "./UI";
import { useGameEngine } from "../hooks/useGameEngine";
import { MobileController } from "./MobileController";
import { degToRad } from "three/src/math/MathUtils";
import { isStreamScreen } from "playroomkit";
import { GameBoard } from "./GameBoard";

export const Experience = () => {

  const {timer } = useGameEngine();
  console.log('Experience timer: ', timer);

  return (
    <>
      <OrbitControls
        maxPolarAngle={degToRad(80)}
        // minDistance={2} 
        // maxDistance={5} 

        // minPolarAngle={Math.PI / 4} // Limit vertical rotation upwards
        // maxPolarAngle={Math.PI / 2} // Limit vertical rotation downwards (e.g., to prevent going below ground)
        // minAzimuthAngle={-Math.PI / 4} // Limit horizontal rotation to the left
        // maxAzimuthAngle={Math.PI / 4}  // Limit horizontal rotation to the right
       />

      {/* <Card /> */}
      {/* <Character character={0} aniamtion="Idle" position={[0, -1, 0]} /> */}
      { isStreamScreen() ? <GameBoard /> : <MobileController /> }

      <Environment preset="dawn" background blur={2} />
    </>
  );

};

