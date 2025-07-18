import { OrbitControls } from "@react-three/drei";

export const Experience = () => {

  return (
    <>
      <OrbitControls
        minDistance={2} 
        maxDistance={9} 

        minPolarAngle={Math.PI / 4} // Limit vertical rotation upwards
        maxPolarAngle={Math.PI / 2} // Limit vertical rotation downwards (e.g., to prevent going below ground)
        minAzimuthAngle={-Math.PI / 4} // Limit horizontal rotation to the left
        maxAzimuthAngle={Math.PI / 4}  // Limit horizontal rotation to the right
       />

      <ambientLight intensity={0.5} />

      <mesh>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </>
  );

};
