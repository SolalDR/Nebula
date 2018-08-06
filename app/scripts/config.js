export default {
  world: {
    size: 2000,
    timeFactor: 0.00001 
  },
  skybox: {
    files: [
      "box-1.jpg",
      "box-2.png",
      "box-3.png",
      "box-5.jpg",
      "box-6.png"
    ]
  },
  camera: {
    position: {
      x: 1000, 
      y: 1000,
      z: 1000
    }
  },
  nebula: {
    textureSize: 1024,
    particlesCount: 50000,
    baseRadius: 300,
    node: {
      radiusFactor: 0.2 
    },
    particle: {
      size: 5000.0,
      color: {r: 255, g: 255, b: 150}
    },
    path: {
      radius: 10,
      depth: 5, 
      count: 5,
      curvePrecision: 11,
      curveTension: 0.1,
      noiseRadius: 300,
      noiseSpeed: 1
    }
  }
}