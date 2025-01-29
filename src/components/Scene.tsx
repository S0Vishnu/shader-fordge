import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Hdri_Image from "../assets/hdr/canary_wharf_2k.hdr"; // Path to your HDRi image
import { createGradientMaterial } from "./shaders/GradientShader";

const Scene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null); // Container for the canvas

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      console.error("Canvas reference or container is not initialized");
      return;
    }

    // Set up the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.offsetWidth / containerRef.current.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(
      containerRef.current.offsetWidth,
      containerRef.current.offsetHeight
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Use ACES Filmic for better cinematic color grading
    renderer.toneMappingExposure = 1.0;

    // Set up the controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Optional: smooth camera movements
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    // Load HDRi image for lighting
    const hdrLoader = new RGBELoader();
    hdrLoader.load(
      Hdri_Image, // Path to your HDRi image
      (hdrTexture) => {
        console.log("HDRi loaded successfully");
        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

        // Use HDRi for lighting (not as environment background)
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

        // Reduce the intensity by multiplying with a scalar value
        const intensity = 1.2; // Adjust this value to reduce the intensity

        // Set the scene's environment map and apply the intensity
        scene.environment = envMap;
        scene.environmentIntensity = intensity;

        const colors = [
          new THREE.Color("#4d2695"),
          new THREE.Color("#b699e9"),
          new THREE.Color("#925df2"),
        ];

        // Create a sphere geometry and material (Orange color)
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = createGradientMaterial({
          colors: colors,
          distortion: true,
          angle: 0,
          smooth: true,
          distortionStrength: .2,
        });
        // const material = new THREE.MeshStandardMaterial({ color: 0xff7f00 }); // Orange color
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add a directional light (milder for cinematic effect)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Reduced intensity
        directionalLight.position.set(5, -5, 5);
        directionalLight.castShadow = true; // Enable shadow casting
        scene.add(directionalLight);

        // Add a soft ambient light to fill in the shadows
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Slightly increased for better shadow filling
        scene.add(ambientLight);
      },
      undefined, // Progress callback (optional)
      (error) => {
        console.error("Failed to load HDRi:", error);
      }
    );

    // Handle container resizing
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        // Get the container's size
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;

        // Resize the renderer and camera
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial render
    handleResize();

    // Render the scene continuously
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls for smooth panning
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="three-canvas"
      ref={containerRef}
      style={{ width: "100%", height: "100vh" }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Scene;
