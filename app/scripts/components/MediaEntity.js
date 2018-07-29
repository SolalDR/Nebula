import config from "./../config.js"
class MediaEntity {

  static get TYPE_PHYSIC() { return 1; }
  static get TYPE_MORAL() { return 2; }
  static get TYPE_MEDIA() { return 3; }

  constructor(object){
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

  sphericalCoord(position, center){
    if( !center ) var center = new THREE.Vector3();
    var sub = new THREE.Vector3().copy(position).sub(center);
    var radius = position.distanceTo( center );
    return {
      theta: Math.arcos(sub.z/radius),
      phi: Math.arcsin(sub.y/(radius*Math.sin(Math.arcos(sub.z/radius))))
    }
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