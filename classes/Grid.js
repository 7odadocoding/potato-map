import ElementGrid from './ElementGrid.js';
import Tile from './Tile.js';

export default class Grid {
   constructor(potatoMap, tilesW, tilesH, locX, locY) {
      this.potatoMap = potatoMap;
      this.locX = locX;
      this.locY = locY;
      this.margin = 3;
      this.tilesW = tilesW;
      this.tilesH = tilesH;
      this.w = tilesW * 11 + this.margin * 12;
      this.h = tilesH * 11 + this.margin * 12;
      this.tiles = Array.from({ length: 11 }, () =>
         Array.from({ length: 11 }, () => null)
      );
      this.mountainSet = new Set(
         [
            [2, 2],
            [4, 9],
            [6, 4],
            [9, 10],
            [10, 6],
         ].map((pair) => pair.join())
      );
      this.selectedTile = {
         row: null,
         col: null,
      };
   }

   drawGridBackground() {
      this.potatoMap.ctx.globalCompositeOperation = 'source-over';
      this.potatoMap.ctx.font = '40pt "Bree Serif"';
      this.potatoMap.ctx.fillStyle = '#000';
      this.potatoMap.ctx.fillText('Potato Map', this.locX, this.locY - 20, 200);
      this.potatoMap.ctx.fillStyle = '#fff';
      this.potatoMap.ctx.strokeStyle = '#fff';
      this.potatoMap.ctx.roundRect(
         this.locX - 5,
         this.locY - 5,
         this.w + 10,
         this.h + 10,
         5
      );
      this.potatoMap.ctx.stroke();
      this.potatoMap.ctx.fill();
   }

   async createGrid() {
      const baseTile = new Tile('empty');
      const image = await baseTile.getTileImage();
      this.drawGridBackground();
      for (let row = 0; row < 11; row++) {
         for (let col = 0; col < 11; col++) {
            const locX = this.locX + (this.tilesW + this.margin) * col + this.margin;
            const locY = this.locY + (this.tilesH + this.margin) * row + this.margin;
            if (this.isMountain(row, col)) {
               this.tiles[row][col] = await this.drawMountain(locX, locY);
            } else {
               this.potatoMap.ctx.drawImage(image, locX, locY, this.tilesW, this.tilesH);
               this.tiles[row][col] = new Tile('empty', locX, locY);
            }
            this.trackCursor(locX, locY, row, col, this.tiles[row][col]);
         }
      }
      this.update();
   }

   async changeTile(x, y, tileName) {
      let name = tileName || this.tiles[x][y].tileName;
      this.tiles[x][y] = new Tile(name, this.tiles[x][y].locX, this.tiles[x][y].locY);
      // console.log(this.tiles[x][y]);
      let image = await this.tiles[x][y].getTileImage();
      this.potatoMap.ctx.drawImage(
         image,
         this.tiles[x][y].locX,
         this.tiles[x][y].locY,
         this.tilesW,
         this.tilesH
      );
      return this.tiles[x][y];
   }

   async drawMountain(locX, locY) {
      const mountainTile = new Tile('mountain', locX, locY);
      const mountainImage = await mountainTile.getTileImage();
      this.potatoMap.ctx.drawImage(mountainImage, locX, locY, this.tilesW, this.tilesH);
      return mountainTile;
   }

   isMountain(row, column) {
      return this.mountainSet.has([row + 1, column + 1].join());
   }

   trackCursor(locX, locY, row, col, tile) {
      this.potatoMap.canvas.addEventListener('mousemove', (event) => {
         const rect = this.potatoMap.canvas.getBoundingClientRect();
         const x = event.clientX - rect.left;
         const y = event.clientY - rect.top;

         if (x >= locX && x <= locX + this.tilesW && y >= locY && y <= locY + this.tilesH)
            this.selectedTile = { row, col };
         if ((x < this.locX || x > this.w) && (y < this.locY || y > this.h))
            this.selectedTile = { row: null, col: null };
         // if (this.selectedTile.row && this.selectedTile.col)
         //    console.log(this.tiles[this.selectedTile.row][this.selectedTile.col]);
      });
   }

   update() {
      this.potatoMap.ctx.globalCompositeOperation = 'source-over';
      for (let row = 0; row < 11; row++) {
         for (let col = 0; col < 11; col++) {
            const tile = this.tiles[row][col];
            if (tile) {
               this.changeTile(col, row);
            }
         }
      }
      requestAnimationFrame(this.update.bind(this));
   }
}
