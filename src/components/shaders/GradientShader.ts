import * as THREE from 'three';

// Define the parameters type for the GradientMaterial
interface GradientMaterialParams {
    colors: THREE.Color[];
    angle?: number; // Add angle for controlling the direction of the gradient
    smooth?: boolean; // Add smooth flag for enabling smooth interpolation
    distortion?: boolean; // Add distortion flag for enabling the wave effect
    distortionStrength?: number; // Add distortion strength for controlling the wave effect
}

// Function to create the GradientMaterial
export function createGradientMaterial({
    colors,
    angle,
    smooth = false, // Default to non-smooth interpolation
    distortion,
    distortionStrength = 0, // Default distortion strength
}: GradientMaterialParams): THREE.ShaderMaterial {
    // Ensure at least two colors are provided for the gradient
    if (colors.length < 2) {
        console.error('GradientMaterial requires at least two colors.');
        return new THREE.ShaderMaterial(); // Return an empty material if invalid input
    }

    // Convert THREE.Color objects to an array of vec3 values for the shader
    const colorArray = colors.map(color => [color.r, color.g, color.b]).flat();

    const uniforms = {
        colors: { value: colorArray },
        colorCount: { value: colors.length }, // Pass the number of colors
        angle: { value: angle || -45 },  // Pass the angle for gradient direction
        distortionStrength: { value: distortion && distortionStrength }, // Pass the distortion strength
    };

    const vertexShader = `
        varying vec3 vPosition;

        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec3 colors[10]; // Max of 10 colors in the gradient array
        uniform int colorCount;  // Number of colors in the array
        uniform float angle;     // Angle for gradient direction
        uniform float distortionStrength; // Distortion strength
        varying vec3 vPosition;

        float sineDistortion(float x, float strength) {
            return sin(x * 10.0) * strength; // Distortion effect based on sine wave
        }

        void main() {
            // Normalize angle to radians and calculate direction
            float rad = angle * 3.14159 / 180.0;  // Convert angle to radians
            vec2 direction = vec2(cos(rad), sin(rad));  // Direction vector based on the angle

            // Calculate the position in the direction of the gradient
            float t = dot(vPosition.xy, direction);  // Dot product to get position along the angle

            // Apply sine wave distortion to the t value
            t += sineDistortion(vPosition.y, distortionStrength); // Distort based on y position for a wavy effect

            // Map t to range [0, 1]
            t = (t + 1.0) * 0.5;  // Normalize to [0, 1]

            // Calculate the step size for interpolation
            float stepSize = 1.0 / float(colorCount - 1);

            // Find the two nearest colors for interpolation
            int index = int(t / stepSize);
            float localT = (t - float(index) * stepSize) / stepSize;

            // Ensure index is within bounds
            index = min(index, colorCount - 2);

            // Smooth interpolation between the two nearest colors
            vec3 color = mix(colors[index], colors[index + 1], smoothstep(0.0, 1.0, localT));

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const smoothfragmentShader = `
    uniform vec3 colors[10]; // Max of 10 colors in the gradient array
    uniform int colorCount;  // Number of colors in the array
    uniform float angle;     // Angle for gradient direction
    uniform float distortionStrength; // Distortion strength
    varying vec3 vPosition;

    // Simple noise function (value between -1 and 1)
    float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 57.0 + i.z * 131.0;
        return mix(mix(mix(sin(n), sin(n + 1.0), f.x), mix(sin(n + 57.0), sin(n + 58.0), f.x), f.y), 
                   mix(mix(sin(n + 131.0), sin(n + 132.0), f.x), mix(sin(n + 188.0), sin(n + 189.0), f.x), f.y), f.z);
    }

    void main() {
        // Normalize angle to radians and calculate direction
        float rad = angle * 3.14159 / 180.0;  // Convert angle to radians
        vec2 direction = vec2(cos(rad), sin(rad));  // Direction vector based on the angle

        // Calculate the position in the direction of the gradient
        float t = dot(vPosition.xy, direction);  // Dot product to get position along the angle

        // Apply noise-based distortion to the t value in all axes
        if (distortionStrength > 0.0) {
            vec3 uv = vPosition * 10.0;  // Scale UV for noise effect in 3D
            float noiseVal = noise(uv);  // Get noise value
            t += noiseVal * distortionStrength;  // Apply noise distortion
        }

        // Map t to range [0, 1]
        t = (t + 1.0) * 0.5;  // Normalize to [0, 1]

        // Calculate the step size for interpolation
        float stepSize = 1.0 / float(colorCount - 1);

        // Find the two nearest colors for interpolation
        int index = int(t / stepSize);
        float localT = (t - float(index) * stepSize) / stepSize;

        // Ensure index is within bounds
        index = min(index, colorCount - 2);

        // Smooth interpolation between the two nearest colors
        vec3 color = mix(colors[index], colors[index + 1], smoothstep(0.0, 1.0, localT));

        gl_FragColor = vec4(color, 1.0);
    }
`;

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: smooth ? fragmentShader : smoothfragmentShader,
    });
}
