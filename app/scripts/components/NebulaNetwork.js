class NebulaNetwork {
  constructor(list){
    this.list = list;
  }

  static fromNode(node) {
    var list = [node];

    var currentNode = node;
    
    currentNode.map((item)=>{
      if( list.indexOf(item) >= 0 ) return false;

      if( item ){
        list.push(item);  
      }
      
      return true;
    })

    return new NebulaNetwork(list);
  }

  get population(){
    var count = 0;
    this.list.forEach(node => count += node.count)
    return count;
  }

  has(item){
    return this.list.indexOf(item) >=0 ? true : false;
  }

  add(item){
    if(!this.has(item)){
      this.list.push(item);
    }
  }


}

export default NebulaNetwork;