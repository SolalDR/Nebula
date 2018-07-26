/**

Represent a path for a node 

*/
import config from "./../config.js";

class NebulaPath {

  constructor(nodes, args = {}) {
    this.nodes = nodes;
    this.width = args.width ? args.width : config.nebula.textureSize;
    this.curvePrecision = config.nebula.path.curvePrecision;
    this.compute();
  }

  get length(){
    return this.points.length;
  }

  start(){
    return this.nodes[0] ? this.nodes[0] : null;
  }

  compute(){
    var points = this.computeCurve(this.curvePrecision);
    this.points = points;

    var helperGeo = new THREE.Geometry();
    this.points.forEach(point => {
      helperGeo.vertices.push(point);
    })
    var helperMat = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    this.helper = new THREE.Line(helperGeo ,helperMat);
  }

  computeCurve(precision){
    var nodeCoords = this.computeLinear(precision);
    var curve = new THREE.CatmullRomCurve3( nodeCoords , false, "centripetal", config.nebula.path.curveTension);
    return curve.getSpacedPoints( config.nebula.textureSize );
  }

  computeLinear(width) {
    var path = [], advancement, advancementGlobal, advancementLocal, from, to, position;
    for(var i=0; i<width; i++){
      advancement = i/width; 
      advancementGlobal = advancement*(this.nodes.length - 1); 
      advancementLocal = advancementGlobal - Math.floor(advancementGlobal)

      from = this.nodes[Math.floor(advancementGlobal)]
      to = this.nodes[Math.ceil(advancementGlobal)]

      position = new THREE.Vector3()
        .copy(from.position)
        .add(
          new THREE.Vector3()
          .copy(to.position)
          .sub(from.position)
          .multiplyScalar(advancementLocal)
        );

      path.push(position); 
    }
    return path;
  }
}

export default NebulaPath;