export default class Tile {
   constructor(tileName) {
      this.tilesPath = './assets/tiles/';
      this.tileName = tileName;
      this.image = new Image();
      this.imageSrc = `${this.tilesPath}${this.tileName}.png`;
      this.locX = null;
      this.locY = null;
   }

   getTileImage() {
      this.image.src = this.imageSrc;
      return this.image;
   }
}
