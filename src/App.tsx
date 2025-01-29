import { Canvas } from "@react-three/fiber";
import "./App.css";
import React_Scene from "./components/R3F_Scene";
import Scene from "./components/Scene";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    localStorage.clear(); // Clears localStorage
    sessionStorage.clear(); // Clears sessionStorage
    // caches.keys().then((cacheNames) => {
    //   cacheNames.forEach((cacheName) => caches.delete(cacheName));
    // });
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        gap: "2px",
      }}
    >
      <div
        className="react-canvas"
        id="react-canvas"
        style={{ flex: 1, width: "50vw", backgroundColor: "black" }}
      >
        <Canvas onLoad={() => console.log("Canvas loaded")}>
          <React_Scene />
        </Canvas>
      </div>
      <div
        className="three-canvas"
        id={"three-canvas"}
        style={{ flex: 1, width: "calc(50vw-2px)" }}
      >
        <Scene />
      </div>
    </div>
  );
}

export default App;
