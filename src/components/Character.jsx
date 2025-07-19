import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";

const CHARACTERS = [ "Anne", "Captain_Barbarossa", "Henry", "Mako"];

export const Character = ({ character = 0, aniamtion = "Idle", ...props }) => {

    const { scene, animations } = useGLTF(`/models/Characters_${CHARACTERS[character]}.gltf`);
    const ref = useRef(); 
    const actions = useAnimations(animations, ref);

    useEffect(() => {
        actions[aniamtion]?.reset().fadeIn(0.5).play();
        return () => actions[aniamtion]?.fadeOut(0.5);
    }, [aniamtion]);


    return (
        <group ref={ref} {...props} >
            <primitive object={scene} />
        </group>
    );

}
