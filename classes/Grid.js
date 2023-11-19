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
      this.currentElement = null;
      this.elementGrid = null;
      this.addClickEventListener();
   }

   drawGridBackground() {
      // this.potatoMap.ctx.globalCompositeOperation = 'source-over';
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
            this.trackCursor(locX, locY, row, col);
         }
      }
      // this.update();
   }

   async changeTile(x, y) {
      if (this.tiles[x][y]) {
         let name = this.tiles[x][y].tileName;
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

   trackCursor(locX, locY, row, col) {
      this.potatoMap.canvas.addEventListener('mousemove', (event) => {
         const rect = this.potatoMap.canvas.getBoundingClientRect();
         const x = event.clientX - rect.left;
         const y = event.clientY - rect.top;
         // console.log(x, y, this.w, this.h);
         if (
            x >= locX &&
            x <= locX + this.tilesW &&
            y >= locY &&
            y <= locY + this.tilesH &&
            this.currentElement
         ) {
            this.selectedTile = { row, col };
            this.drawPlacementIndicator();
         }

         if (
            x < this.locX ||
            x > this.w + this.locX ||
            y < this.locY ||
            y > this.h + this.locY
         ) {
            this.selectedTile = { row: null, col: null };
            this.clearIndicator();
         }
         // if (this.selectedTile.row && this.selectedTile.col)
         //    console.log(this.tiles[this.selectedTile.row][this.selectedTile.col]);
      });
   }

   addClickEventListener() {
      this.potatoMap.canvas.addEventListener('click', (event) => {
         const mouseX =
            event.clientX - this.potatoMap.canvas.getBoundingClientRect().left;
         const mouseY = event.clientY - this.potatoMap.canvas.getBoundingClientRect().top;

         // Check if the click is within the grid area
         if (
            mouseX >= this.locX &&
            mouseX <= this.locX + this.w &&
            mouseY >= this.locY &&
            mouseY <= this.locY + this.h
         ) {
            // Calculate the selected tile based on the click position
            const selectedCol = Math.floor(
               (mouseX - this.locX) / (this.tilesW + this.margin)
            );
            const selectedRow = Math.floor(
               (mouseY - this.locY) / (this.tilesH + this.margin)
            );

            this.selectedTile = { row: selectedRow, col: selectedCol };

            // Place the this.currentElement on the selected tile
            if (this.currentElement && this.elementGrid) {
               this.placeElement();
            }
         }
      });
   }

   placeElement() {
      if (this.checkIsElementPlacable()) {
         this.elementGrid.createRandomElement();
         const { currentElement, selectedTile } = this;
         const gridSize = currentElement.shape.length;

         // Calculate the starting position for the element placement
         const locX =
            this.locX + (this.tilesW + this.margin) * selectedTile.col + this.margin;
         const locY =
            this.locY + (this.tilesH + this.margin) * selectedTile.row + this.margin;

         // Iterate over the element shape and update the corresponding tiles in Grid.tiles
         for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
               const gridRow = selectedTile.row + row;
               const gridCol = selectedTile.col + col;

               if (
                  gridRow >= 0 &&
                  gridRow < this.tiles.length &&
                  gridCol >= 0 &&
                  gridCol < this.tiles[gridRow].length
               ) {
                  // Check if the cell in the element shape is 1
                  if (currentElement.shape[row][col] === 1) {
                     const tile = new Tile(
                        currentElement.type,
                        locX + col * (this.tilesW + this.margin),
                        locY + row * (this.tilesH + this.margin)
                     );
                     this.tiles[gridRow][gridCol] = tile;
                  }
               }
            }
         }
      }
   }

   checkIsElementPlacable() {
      const { currentElement, tiles, selectedTile } = this;

      // Get 3x3 array from tiles starting from the selectedTile
      const gridSize = 3; // You can adjust this based on your requirements
      const gridArray = [];
      for (let i = 0; i < gridSize; i++) {
         const rowArray = [];
         for (let j = 0; j < gridSize; j++) {
            const rowIndex = selectedTile.row + i;
            const colIndex = selectedTile.col + j;

            // Check if the indices are within the valid range
            if (
               rowIndex >= 0 &&
               rowIndex < tiles.length &&
               colIndex >= 0 &&
               colIndex < tiles[rowIndex].length
            ) {
               rowArray.push(tiles[rowIndex][colIndex]);
            } else {
               // Handle the case where the indices are out of bounds
               rowArray.push(null); // You might want to adjust this based on your requirements
            }
         }
         gridArray.push(rowArray);
      }

      // Loop through the grid and check for collision
      for (let row = 0; row < gridSize; row++) {
         for (let col = 0; col < gridSize; col++) {
            const cellValue = currentElement.shape[row][col];
            const tile = gridArray[row][col];

            if (cellValue === 1 && (tile === null || tile.tileName !== 'empty')) {
               // Collision detected, element cannot be placed on non-empty tiles
               return false;
            }
         }
      }
      // No collision detected, element can be placed
      return true;
   }

   drawPlacementIndicator() {
      // Check if the selected tile is within the grid
      this.clearIndicator();
      if (
         this.selectedTile.row !== null &&
         this.selectedTile.col !== null &&
         this.selectedTile.row >= 0 &&
         this.selectedTile.row < this.tiles.length &&
         this.selectedTile.col >= 0 &&
         this.selectedTile.col < this.tiles[0].length
      ) {
         const { currentElement } = this;
         const gridSize = currentElement.shape.length;

         // Calculate the starting position for the indicator
         const locX =
            this.locX + (this.tilesW + this.margin) * this.selectedTile.col + this.margin;
         const locY =
            this.locY + (this.tilesH + this.margin) * this.selectedTile.row + this.margin;

         // Draw outline or highlight for the area where the element will be placed
         this.potatoMap.ctx.beginPath();
         this.potatoMap.ctx.lineWidth = 2;
         this.potatoMap.ctx.strokeStyle = this.checkIsElementPlacable() ? 'green' : 'red';

         // Iterate over the element shape and highlight cells with value == 1
         for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
               if (currentElement.shape[row][col] === 1) {
                  const cellX = locX + col * (this.tilesW + this.margin);
                  const cellY = locY + row * (this.tilesH + this.margin);
                  const cellWidth = this.tilesW;
                  const cellHeight = this.tilesH;

                  // Check if the cell is within the bounds of the grid
                  if (
                     cellX >= this.locX &&
                     cellX + cellWidth <= this.locX + this.w &&
                     cellY >= this.locY &&
                     cellY + cellHeight <= this.locY + this.h
                  ) {
                     this.potatoMap.ctx.rect(cellX, cellY, cellWidth, cellHeight);
                  }
               }
            }
         }

         this.potatoMap.ctx.stroke();
      }
   }
   clearIndicator() {
      // Reset the stroke style to white
      this.potatoMap.ctx.strokeStyle = 'white';

      for (let row = 0; row < 11; row++) {
         for (let col = 0; col < 11; col++) {
            const tile = this.tiles[row][col];
            if (tile) {
               const locX = tile.locX;
               const locY = tile.locY;
               const cellWidth = this.tilesW;
               const cellHeight = this.tilesH;

               // Draw a white rectangle to remove the old placement indicator
               this.potatoMap.ctx.beginPath();
               this.potatoMap.ctx.lineWidth = 1;
               this.potatoMap.ctx.rect(locX, locY, cellWidth, cellHeight);
               this.potatoMap.ctx.stroke();
            }
         }
      }
   }

   async updateTiles() {
      this.potatoMap.ctx.globalCompositeOperation = 'source-over';

      for (let row = 0; row < 11; row++) {
         for (let col = 0; col < 11; col++) {
            const tile = this.tiles[row][col];
            if (tile) {
               await this.changeTile(col, row);
            }
         }
      }
   }
}
