declare module 'three/examples/jsm/loaders/RGBELoader' {
    import { TextureLoader } from 'three';
    export class RGBELoader extends TextureLoader {
        constructor();
        load(url: string, onLoad?: (texture: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): any;
    }
}

declare module '*.hdr' {
    const value: string;
    export default value;
}

// src/types/three.d.ts

declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera, EventDispatcher, MOUSE, Vector2, Vector3, Object3D } from 'three';
  
    export class OrbitControls extends EventDispatcher {
      constructor(camera: Camera, domElement: HTMLElement);
  
      object: Camera;
      domElement: HTMLElement;
  
      // The below properties are just examples. You can extend this as per your needs
      enableDamping: boolean;
      dampingFactor: number;
      screenSpacePanning: boolean;
      maxPolarAngle: number;
      minDistance: number;
      maxDistance: number;
  
      // Methods
      update(): void;
      dispose(): void;
      listenToKeyEvents(domElement: HTMLElement): void;
    }
  }
  