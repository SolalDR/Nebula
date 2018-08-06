import config from "./../config.js"
class MediaEntity {

  static get TYPE_PHYSIC() { return 1; }
  static get TYPE_MORAL() { return 2; }
  static get TYPE_MEDIA() { return 3; }

  constructor(object){
    this.element; // HTML ELEMENT 
    this.node;    // NebulaNode
    this.name = object.nom;
    this.type = parseInt(object.typeCode);
    this.rank = parseInt(object.rangChallenges);
    this.mediaType = object.mediaType;
    this.diffusion = object.diffusion ? parseInt(object.diffusion) : 0;
    this.childs = [];
    this.parents = [];
  }

  get isRoot(){
    return this.parents.length === 0 ? true : false; 
  } 

  get isEnd() {
    return this.childs.length === 0 ? true : false; 
  }

  get childrenHasDiffusion(){
    var c = 0;
    for(var i=0; i<this.childs.length; i++){
      c += this.childs[i].child.diffusion;
    }
    return c;
  }

  get mediasLinked() {
    var result = [];
    this.childs.forEach(child => result.push(child.child))
    this.parents.forEach(parent => result.push(parent.parent))
    return result;
  }

  sphericalCoord(position, center){
    if( !center ) var center = new THREE.Vector3();
    var sub = new THREE.Vector3().copy(position).sub(center);
    var radius = position.distanceTo( center );
    return {
      theta: Math.arcos(sub.z/radius),
      phi: Math.arcsin(sub.y/(radius*Math.sin(Math.arcos(sub.z/radius))))
    }
  }

  getParentsCenter() {
    var sum = new THREE.Vector3();
    var sumIteration = 0;
    this.parents.forEach(parent => {
      if( parent.parent.position ){
        sum.add(parent.parent.position);  
        sumIteration++;
      }
    })

   
    sum.multiplyScalar(1/sumIteration);
    return sum;
  }

  computePosition(){
    if(this.parents.length === 0){
      var phi = Math.random()*2*Math.PI;
      var theta = Math.random()*2*Math.PI;
      var position = new THREE.Vector3(
        config.nebula.baseRadius*Math.sin(theta)*Math.cos(phi),
        config.nebula.baseRadius*Math.sin(theta)*Math.sin(phi),
        config.nebula.baseRadius*Math.cos(theta)
      );
      this.position = position.add(new THREE.Vector3(1000, 1000, 1000));
    } else {
      
      if( !this.position ){
        this.position = new THREE.Vector3(Math.random()*500, Math.random()*500, Math.random()*500)
        var center = this.getParentsCenter();
        this.position = center.clone()
          .sub(new THREE.Vector3(1000, 1000, 1000))
          .normalize()
          .multiplyScalar(300)

        this.position.add(center).add(this.position)
      }
      this.position = new THREE.Vector3(Math.random()*2000, Math.random()*2000, Math.random()*2000)
    }
  }

  sum(){
    var sum = this.diffusion;
    for(var i=0; i<this.childs.length; i++){
      sum += this.childs[i].getComputedPart(); 
    }
    return sum;
  }

  map(callback, toChild = true){
    callback.call(this, this);
    if( toChild ){
      for(var i=0; i<this.childs.length; i++){
        this.childs[i].child.map(callback);
      }
    } else {
      for(var i=0; i<this.parents.length; i++){
        this.parents[i].parent.map(callback);
      }
    }
  }

  addRelation(relation){
    if( relation.parent_id == this.name ){
      this.childs.push(relation);
      relation.parent = this;
    } else if(relation.child_id == this.name) {
      this.parents.push(relation);
      relation.child = this;
    }
  }

}

export default MediaEntity;