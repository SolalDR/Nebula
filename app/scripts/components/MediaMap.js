  
import MediaEntity from "./MediaEntity.js";
import MediaRelation from "./MediaRelation.js";
import MediaNetwork from "./MediaNetwork.js";

import medias from "./../../datas/medias.json";
import relations from "./../../datas/relations_medias.json";
import config from "./../config.js";

class MediaMap {
  constructor() {
    this.medias = {};
    this.relations = [];
    this.networks = [];

    medias.forEach(media => {
      if( media.diffusion > 0 || parseInt(media["typeCode"]) !== MediaEntity.TYPE_MEDIA ){
        var m = new MediaEntity(media);
        this.medias[m.name] = m;
      }
    });

    relations.forEach(relation => {
      var r = new MediaRelation(relation);
      if( this.medias[r.parent_id] && this.medias[r.child_id] ){
        this.relations.push(r);
        this.medias[r.parent_id].addRelation(r);
        this.medias[r.child_id].addRelation(r);
      }
    });

    for(var i in this.medias){
      this.medias[i].map((media)=>{
        if(media.diffusion == 0){
          media.diffusion = media.sum();
          media.map(m => { m.diffusion = m.sum();}, false)
        }
      }, false)
    }
  }

  get count(){
    var sum = 0; 
    for(var i in this.medias){
      if( this.medias[i].diffusion ){
        sum += this.medias[i].diffusion; 
      }
    }
    return sum;
  }

  get nodesFormated(){
    var nodes = [];
    var relations = [];
    var rat = this.count/config.nebula.particlesCount;
    
    function indexInNodes(name){
      for(var i=0; i<nodes.length; i++){
        if( nodes[i].name == name ){
          return i;
        }
      }
      console.log(name);
    }

    for(var i in this.medias){
      if(this.medias[i].diffusion && this.medias[i].position){
        nodes.push({
          name: this.medias[i].name,
          count: this.medias[i].diffusion/rat,
          position: this.medias[i].position,
          media: this.medias[i]
        })
      }
    }

    for(var i in this.medias){
      for(var j=0; j<this.medias[i].childs.length; j++){
        if( this.medias[i].diffusion && this.medias[i].childs[j].child.diffusion ){
          var parentId = indexInNodes(this.medias[i].name);
          var childId = indexInNodes(this.medias[i].childs[j].child.name);
          relations.push([ parentId, childId ])
        }
      }
    } 
    return {
      nodes: nodes, 
      relations: relations
    }
  }

  get parentsNode() {
    var parents = [];
    for(var i in this.medias){
      if( this.medias[i].parents.length == 0 ){
        parents.push(this.medias[i]);  
      }
    }
    return parents;
  }

  computePositions(){
    var parentsNode = this.parentsNode;
    parentsNode.forEach(media => {
      media.computePosition();
    })

    parentsNode.forEach(media => {
      media.map((child)=>{
        child.computePosition();
      })
    })
  }
}

export default MediaMap;