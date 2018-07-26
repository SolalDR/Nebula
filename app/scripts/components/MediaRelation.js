class MediaRelation {
  constructor(object) {
    this.parent_id = object.origine;
    this.child_id = object.cible;
    this.intensity = parseInt(object.valeur);
  }

  getComputedPart(){
    return this.child.diffusion*(this.intensity/100);
  }
}

export default MediaRelation;