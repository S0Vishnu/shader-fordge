import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';

interface OutlineProps {
    objects: THREE.Object3D[];  // Objects to be outlined
    outlineColor: THREE.Color | string;  // Outline color
    outlineThickness: number;  // Outline thickness
}

const OutlineEffect: React.FC<OutlineProps> = ({ objects, outlineColor, outlineThickness }) => {
    console.log('objects: ', objects);
    const [outlines, setOutlines] = useState<Map<THREE.Object3D, THREE.Mesh>>(new Map());
    const sceneRef = useRef<THREE.Scene | null>(null);

    // Type guard to check if the object is a Mesh
    function isMesh(object: THREE.Object3D): object is THREE.Mesh {
        return object instanceof THREE.Mesh;
    }

    // Function to create an outline mesh for a given object
    function createOutlineMesh(object: THREE.Object3D, outlineColor: THREE.Color, outlineThickness: number): THREE.Mesh | null {
        if (!isMesh(object)) {
            console.warn('The provided object is not a Mesh and cannot be outlined.');
            return null;
        }

        const geometry = object.geometry.clone();
        geometry.applyMatrix4(new THREE.Matrix4().makeScale(1 + outlineThickness, 1 + outlineThickness, 1 + outlineThickness));

        const material = new THREE.ShaderMaterial({
            vertexShader: outlineVertexShader,
            fragmentShader: outlineFragmentShader,
            uniforms: {
                outlineThickness: { value: outlineThickness },
                outlineColor: { value: outlineColor },
            },
            side: THREE.BackSide,
            depthWrite: false,
            transparent: true,
        });

        const outlineMesh = new THREE.Mesh(geometry, material);
        outlineMesh.renderOrder = -1; // Render behind the object
        return outlineMesh;
    }

    // Shader code for outline
    const outlineVertexShader = `
    uniform float outlineThickness;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec3 position;

    void main() {
      vec3 scaledPosition = position * (1.0 + outlineThickness);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPosition, 1.0);
    }
  `;

    const outlineFragmentShader = `
    uniform vec3 outlineColor;

    void main() {
      gl_FragColor = vec4(outlineColor, 1.0);
    }
  `;

    // Effect hook to create and manage outlines
    useEffect(() => {
        if (!sceneRef.current) return;

        const newOutlines = new Map<THREE.Object3D, THREE.Mesh>();

        objects.forEach((object) => {
            const existingOutline = outlines.get(object);
            if (existingOutline) {
                sceneRef?.current?.remove(existingOutline);
            }

            const outlineMesh = createOutlineMesh(object, new THREE.Color(outlineColor), outlineThickness);
            if (outlineMesh) {
                newOutlines.set(object, outlineMesh);
                sceneRef?.current?.add(outlineMesh); // Add the outline mesh to the scene
            }
        });

        // Remove old outlines that are no longer in the objects array
        outlines.forEach((outlineMesh, object) => {
            if (!objects.includes(object)) {
                sceneRef?.current?.remove(outlineMesh);
                newOutlines.delete(object);
            }
        });

        // Update the state with the new outline meshes
        setOutlines(newOutlines);

        return () => {
            // Cleanup when the component unmounts or when objects change
            outlines.forEach((outlineMesh) => {
                sceneRef.current?.remove(outlineMesh);
            });
        };
    }, [objects, outlineColor, outlineThickness]); // Re-run whenever objects, color or thickness change

    return null; // This component doesn't render anything to the DOM directly
};

export default OutlineEffect;


/**
 * Usage:
    <OutlineEffect
       objects={[meshRef.current]} // Pass the mesh to the outline effect
       outlineColor={0xff0000} // Set the outline color to red
       outlineThickness={0.1} // Set the outline thickness
    />
 */
