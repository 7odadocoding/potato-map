export default class Tile {
   constructor(tileName, locX = 0 , locY = 0) {
      this.tilesPath = './assets/tiles/';
      this.tileName = tileName;
      this.image = new Image();
      this.imageSrc = `${this.tilesPath}${this.tileName}.png`;
      this.locX = locX;
      this.locY = locY;
   }

   getTileImage() {
      this.image.src = this.imageSrc;
      return this.image;
   }
}
