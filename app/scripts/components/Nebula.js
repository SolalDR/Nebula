import vertex from "./../../glsl/model.vert"
import fragment from "./../../glsl/model.frag"
import NebulaNode from "./NebulaNode"
import NebulaNetwork from "./NebulaNetwork"
import config from "./../config.js"

class Nebula {
  
  constructor(args) {
    this.nodes = [];
    this.networks = [];
    this.debug = !args.debug ? false : true;
    this.scene = args.scene;
    this.config = config;
    this.gui = args.gui;
    this.storedNodes = args.nodes;
    this.storedRelation = args.relations;
    this.initDatGui();
    this.init();
    
  }

  reset(){
    this.scene.remove(this.mesh);
    this.init();
    this.scene.add(this.mesh);
  } 

  init(){
    this.computeNodes(this.storedNodes);
    this.computeRelations(this.storedRelation);
    this.computeTexture();
    this.computeGeometry();
    this.computeMaterial();
    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  initDatGui(){
    var nebulaFolder = this.gui.addFolder('Nebula');
    var pathF = nebulaFolder.addFolder("Paths");

    nebulaFolder.add(this.config.nebula.particle, "size");
    nebulaFolder.addColor(this.config.nebula.particle, "color").onChange((color)=>{
      console.log(this.material.uniforms.u_particle_color.value)
      this.material.uniforms.u_particle_color.value = [color.r/255, color.g/255, color.b/255];
      this.material.uniforms.needsUpdate = true; 
    });

    var pathsC = [];
    pathsC.push(pathF.add(this.config.nebula.path, 'radius', 0, 300));
    // pathsC.push(pathF.add(this.config.nebula.path, 'depth', 0, 10));
    // pathsC.push(pathF.add(this.config.nebula.path, 'count', 0, 20));
    // pathsC.push(pathF.add(this.config.nebula.path, 'curvePrecision', 0, 100));
    // pathsC.push(pathF.add(this.config.nebula.path, 'curveTension', 0, 1));
    pathsC.forEach(controller => controller.onFinishChange(()=>{
      this.reset();
    }))

    var uniformC = [];
    uniformC.push(pathF.add(this.config.nebula.path, 'noiseSpeed', 0, 1));  
    uniformC.push(pathF.add(this.config.nebula.path, 'noiseRadius', 0, 600));
    
    uniformC.forEach(uniform => uniform.onChange(()=>{
      this.material.uniforms.u_noise_speed.value = this.config.nebula.path.noiseSpeed;
      this.material.uniforms.u_noise_radius.value = this.config.nebula.path.noiseRadius;
      this.material.uniforms.needsUpdate = true;
    }))

  }

  get population() {
    var count = 0;
    this.nodes.forEach(node => count += node.count)
    return count;
  }


  computeNodes(nodes) {
    for(var i=0; i<nodes.length; i++){
      this.nodes.push(new NebulaNode(i, nodes[i]));
    }
  }


  computeRelations(relations) {
    // Create intern relation
    for(var i=0; i < relations.length; i++){
      this.nodes[relations[i][0]].nodes.push(this.nodes[relations[i][1]])
      this.nodes[relations[i][1]].nodes.push(this.nodes[relations[i][0]])
    }

    // Create global network
    var currentNodeRegister = false;
    for(var i=0; i<this.nodes.length; i++){
      currentNodeRegister = false;
      for(var j=0; j<this.networks.length; j++){
        if(this.networks[j].has(this.nodes[i])) {
          currentNodeRegister = true;
        }
      }

      if( !currentNodeRegister ) {
        for(var k=0; k<this.nodes[i].nodes.length; k++) {
          for(var j=0; j<this.networks.length; j++){
            if( this.networks[j].has(this.nodes[i].nodes[k]) ){
              this.networks[j].add(this.nodes[i]);
              currentNodeRegister = true; 
            }
          }
        }
        
        if( !currentNodeRegister ){
          this.networks.push(NebulaNetwork.fromNode(this.nodes[i]));
        }
      }
    }

    // Register network 
    for(var i=0; i<this.networks.length; i++){
      this.networks[i].list.forEach(node => {
        node.network = this.networks[i]
      })
    }

  }

  computeTexture(){
    var paths = [];
    this.nodes.forEach(node => {
      node.computePaths();
      node.paths.forEach(path => {
        paths.push(path);
      })
    })

    var size = paths[0].length;   // 1024/2048
    this.each = size/paths.length;
    var data = new Uint8Array(size*size*3);
    var currentPath; 
    var count = 0;
    for(var i=0; i<size; i++){
      currentPath = paths[Math.floor(i/this.each)].points;
      for(var j=0; j<size; j++){
        data[count*3] =     currentPath[j].x / config.world.size * 255
        data[count*3 + 1] = currentPath[j].y / config.world.size * 255
        data[count*3 + 2] = currentPath[j].z / config.world.size * 255
        count++;
      }
    }

    this.texture = new THREE.DataTexture( data, size, size, THREE.RGBFormat );
    this.texture.needsUpdate = true

    if( this.debug ){
      var geometry = new THREE.PlaneGeometry( config.world.size, config.world.size, 32 );
      var material = new THREE.MeshBasicMaterial( {
        color: 0xffff00, 
        side: THREE.DoubleSide,
        map: this.texture 
      } );
      this.debugPlane = new THREE.Mesh( geometry, material );
    }

    this.paths = paths;

    if( this.debug ){
      this.paths.forEach(path => {
        this.scene.add(path.helper);
      })
    }
  }

  computeGeometry(){
    this.geometry = new THREE.BufferGeometry();

    var verticesBuffer = new Float32Array(this.population*3);
    var offsetBuffer = new Float32Array(this.population);
    var idsBuffer = new Float32Array(this.population);

    var index = 0;
    for(var i=0; i<this.nodes.length; i++){
      for(var j=0; j<this.nodes[i].count; j++){
        verticesBuffer[index*3] =     Math.random()*config.nebula.path.radius - config.nebula.path.radius/2
        verticesBuffer[index*3 + 1] = Math.random()*config.nebula.path.radius - config.nebula.path.radius/2
        verticesBuffer[index*3 + 2] = Math.random()*config.nebula.path.radius - config.nebula.path.radius/2

        offsetBuffer[index] = Math.random()*Math.PI*2;

        var id = this.paths.indexOf(this.nodes[i].getRandomPath(index));
        idsBuffer[index] = this.each*id/config.nebula.textureSize

        index++;
      }
    }

    this.geometry.addAttribute( 'position', new THREE.BufferAttribute( verticesBuffer, 3 ) );
    this.geometry.addAttribute( 'id', new THREE.BufferAttribute( idsBuffer, 1 ) );
    this.geometry.addAttribute( 'offset', new THREE.BufferAttribute( offsetBuffer, 1 ) );
  }

  computeMaterial(){
    var noise = new THREE.TextureLoader().load( '/static/images/noise_3d.png' );
    var flare = new THREE.TextureLoader().load( '/static/images/flare.png' );
    
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex, 
      fragmentShader: fragment,
      transparent: true,
      depthTest: true, 
      depthWrite: false,
      uniforms: {
        u_paths: {value: this.texture},
        u_particle_size: {type: "f", value: config.nebula.particle.size},
        u_particle_color: {type: "3f", value: [ config.nebula.particle.color.r/255, config.nebula.particle.color.g/255, config.nebula.particle.color.b/255 ]},
        u_paths: {value: this.texture},
        u_flare: {value: flare},
        u_noise: {value: noise},
        u_time: { type: "f", value: 0 },
        u_noise_radius: {type: "f", value: this.config.nebula.path.noiseRadius},
        u_noise_speed: {type: "f", value: this.config.nebula.path.noiseSpeed}
      }
    })
  }

  render(time) {
    this.mesh.material.uniforms.u_time.value = time*config.world.timeFactor;
    this.mesh.material.needsUpdate = true;
  }
}

export default Nebula;