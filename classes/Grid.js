import Tile from './Tile.js';

export default class Grid {
   constructor(potatoMap, tilesW, tilesH, locX, locY) {
      this.potatoMap = potatoMap;
      this.locX = locX;
      this.locY = locY;
      this.margin = 3;
      this.tilesW = tilesW;
      this.tilesH = tilesH;
      this.w = tilesW * 11 + this.margin * 2 + this.margin * 10;
      this.h = tilesH * 11 + this.margin * 2 + this.margin * 10;
      this.tiles = [[], [], [], [], [], [], [], [], [], [], []];
   }

   createGrid() {
      const baseTile = new Tile('empty');
      const image = baseTile.getTileImage();
      image.onload = () => {
         this.potatoMap.ctx.font = '40pt "Bree Serif"';
         this.potatoMap.ctx.fillStyle = '#000';
         this.potatoMap.ctx.fillText('Potato Map', this.locX, this.locY - 20, 200);
         this.potatoMap.ctx.fillStyle = '#fff';
         this.potatoMap.ctx.fillRect(
            this.locX - 5,
            this.locY - 5,
            this.w + 10,
            this.h + 10
         );
         let rows = 0;
         while (rows < 11) {
            for (let i = 0; i < 11; i++) {
               const locX = this.locX + (this.tilesW * i + this.margin + this.margin * i);
               const locY =
                  this.locY + (this.tilesH * rows + this.margin + this.margin * rows);
               if (this.isMountain(rows, i)) {
                  this.tiles[rows][i] = this.drawMountain(locX, locY);
               } else {
                  this.potatoMap.ctx.drawImage(
                     image,
                     locX,
                     locY,
                     this.tilesW,
                     this.tilesH
                  );
                  baseTile.locX = locX;
                  baseTile.locY = locY;
                  this.tiles[rows][i] = baseTile;
               }
            }
            rows++;
         }
      };
   }
   changeTile(x, y, tileName) {
      const tile = new Tile(tileName);
      tile.getTileImage().onload = () => {
         this.tiles[x][y] = tile;
      };
      return tile;
   }

   drawMountain(locX, locY) {
      const mountainTile = new Tile('mountain');
      const mountainImage = mountainTile.getTileImage();
      mountainImage.onload = () => {
         this.potatoMap.ctx.drawImage(
            mountainImage,
            locX,
            locY,
            this.tilesW,
            this.tilesH
         );
      };
      return mountainTile;
   }

   isMountain(row, column) {
      return JSON.stringify([
         [2, 2],
         [4, 9],
         [6, 4],
         [9, 10],
         [10, 6],
      ]).includes(JSON.stringify([row + 1, column + 1]));
   }
}
