/**

NebulaNode represent a teluric node. From this node, paths are created it 
represent the travel a point can do going node from node
- id => To identify to other nodes
- count => The started population (number of point attached at beginning)
- position => Epicenter of the node
- network => Reference to the network (See NebulaNetword)
- radius => Radius out the epicenter computed from population (count)
- nodes => array of nodes linked to the current node (has_and_belongs_to_many)
- depthPath => Number of node that a particule can cross before going back
- countPath => Number of different path from a single node

*/

import NebulaPath from "./NebulaPath";
import config from "./../config.js";

class NebulaNode {
  constructor(id, args){
    this.id = id;
    this.count = args.count; 
    this.position = args.position;
    this._network = null;
    this.radius = this.count*0.2;
    this.nodes = [];
    this.depthPath = config.nebula.path.depth;
    this.countPath = config.nebula.path.count;
    this.paths = [];
  }

  map(callback){
    for(var i=0; i<this.nodes.length; i++){
      var prevent = callback.call(this);
      if(!prevent){
        this.nodes[i].map(callback)  
      }
    }
  }

  computePaths(){
    var index = 0;
    var paths = [];
    var tmp = null;

    var path, current; 
    for(var i=0; i<this.countPath; i++){
      path = [this];
      current = this; 
      for(var j=0; j<this.depthPath; j++){
        tmp = current.getRandomChild();
        path.push(tmp);
        current = tmp;
      }
      paths.push(path);
    }

    paths.forEach(path => {
      this.paths.push(new NebulaPath(path))
    })
  }


  getRandomChild(){
    var sum = 0, indexed = []; 
    for(var i=0; i<this.nodes.length; i++){
      sum += this.nodes[i].popularity;
      indexed[i] = sum;
    }
    var rand = Math.random()*sum;
    for(var i=0; i<indexed.length; i++){
      if( rand < indexed[i]) {
        return this.nodes[i];
      }
    }
    return this;
  } 

  getRandomPath(index){
    return this.paths[index%this.paths.length];
  }

  get popularity(){
    if( this.network ){
      return this.count/this.network.population;  
    }
    return 1;
  }

  get network(){
    return this._network; 
  }

  set network(network){
    this._network = network;
  }
}

export default NebulaNode;