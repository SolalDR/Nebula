export default {

  initListener: function(){
    console.log(this.mediaMap);
    this.input.addEventListener("input", ()=>{
      var medias = [];
      if(this.input.value != ""){
        for(var i in this.mediaMap.medias){
          if(i.indexOf(this.input.value) >= 0){
            medias.push(this.mediaMap.medias[i]);
          }
        }
      }
      
      this.updateMediaList(medias);
    })
  },

  createNodeFromMedia: function(media){
    var element = document.createElement("div");
    element.className = "search__item search__item--"+media.type;
    element.innerHTML = "<p class='search__item-label'>"+ media.name +"</p>";
    element.addEventListener("click", ()=>{
      this.onSelect.call(this, media);
    });
    return element;
  },

  updateMediaList: function(medias){
    this.responseContainer.innerHTML = "";
    for(var i=0; i<medias.length; i++){
      this.responseContainer.appendChild(this.createNodeFromMedia(medias[i]));
    }
    console.log(this.responseContainer);
  },

  init: function(mediaMap, args){
    this.input = document.querySelector("#search-medias");
    this.onSelect = args.onSelect;
    this.responseContainer = document.querySelector(".search__response");
    this.mediaMap = mediaMap;

    this.initListener();
  }
}