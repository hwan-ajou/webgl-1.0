# BOOK : Real-Time 3D Graphics with WebGL 2 

* Packt, Farhad Chayour and Diego Cantor

## Chapter 11 WebGL Highlights

### Vertex Array Object 

### Wider Rnage of Texuter Format

### 3D Texture

### Texture Array

### Inctanced Rendering

### Not 2^n texture support

### Fragment Depth

### Texture Size in Shaders

in shader - vec2 size = textureSize(sampler, lod);

### Sync objects

### Direct texel lookup

### Flexible Shader Loops

### Shader Matrix Functions

### Common Compressed Texture

### Uniform Buffer Object

### Integer Textures and Attir

### Transform Feedback

### Sampler Objects

### Depth Textures

### Standard Derivatives

### UNSIGNED_INT indices

### Blend - Min / Max

### Multiple Render Target

### Texture Access in Vertex Shader

### Multi-Sampled Renderbuffers

### Query objects

### Texture LOD

### Floating point Textures Always available

### Migrating to WebGL 2

``` C
// In WebGL 1
const names = ['WebGL', 'experimental-WebGL', 'webkit-3d', 'moz-WebGL'];
 for (let i = 0; i < names.length; ++i) {
  try {
    const context = canvas.getContext(names[i]);
    // work with context
  } catch (e) {
    console.log('Error attaining WebGL context', e);
  }
} 

// In WebGL 2
const context = canvas.getContext('WebGL 2');

```