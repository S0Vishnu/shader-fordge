import React, { useState, useRef, useEffect } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";

const ReactScene: React.FC = () => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const sphereRef = useRef<any | null>(null); // Adjust the type to Mesh
  const { camera, gl } = useThree();

  // Updated handleClick function to use the native MouseEvent
  const handleClick = (event: MouseEvent) => {
    // Get the canvas element
    const canvas = gl.domElement;

    // Get canvas bounding rectangle
    const rect = canvas.getBoundingClientRect();

    // Convert mouse coordinates to normalized device coordinates (NDC)
    const mouse = new Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Create a raycaster
    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Check for intersection with the sphere
    if (sphereRef.current) {
      const intersects = raycaster.intersectObject(sphereRef.current);
      if (intersects.length > 0) {
        const object = !isClicked;
        // Toggle the clicked state if the sphere is clicked
        setIsClicked((pre) => !pre);
      } else {
        // Reset the state if clicked outside
        setIsClicked(false);
      }
    }
  };

  // Use useEffect to add and clean up the event listener
  useEffect(() => {
    const canvas = gl.domElement;

    if (canvas) {
      // Add event listener to the canvas element
      canvas.addEventListener("click", handleClick);

      // Clean up the event listener on component unmount
      return () => {
        canvas.removeEventListener("click", handleClick);
      };
    }
  }, [gl.domElement]); // Run the effect when gl.domElement changes

  return (
    <>
      {/* Add the sphere */}
      <mesh ref={sphereRef} visible={true} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={isClicked ? "green" : "orange"} />
      </mesh>

      {/* Add lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Add an environment */}
      <Environment preset="city" />

      {/* Add controls */}
      <OrbitControls />

    </>
  );
};

export default ReactScene;
