export default {
  world: {
    size: 2000,
    timeFactor: 0.00001 
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
    node: {
      radiusFactor: 0.2 
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