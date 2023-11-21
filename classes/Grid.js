import { missions } from './Mission.js';
import Tile from './Tile.js';
import { GRID_SIZE, MARGIN } from '../data/constants.js';

export default class Grid {
   constructor(potatoMap, tilesW, tilesH, locX, locY) {
      this.potatoMap = potatoMap;
      this.locX = locX;
      this.locY = locY;
      this.margin = MARGIN;
      this.tilesW = tilesW;
      this.tilesH = tilesH;
      this.w = tilesW * GRID_SIZE + this.margin * (GRID_SIZE + 1);
      this.h = tilesH * GRID_SIZE + this.margin * (GRID_SIZE + 1);
      this.tiles = Array.from({ length: GRID_SIZE }, () =>
         Array.from({ length: GRID_SIZE }, () => null)
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
      this.missions = {
         A: { points: 0, missionName: '' },
         B: { points: 0, missionName: '' },
         C: { points: 0, missionName: '' },
         D: { points: 0, missionName: '' },
      };
      this.basicMissions = missions.basic.map((Mission, i) => {
         const mission = new Mission();
         this.missions[Object.keys(this.missions)[i]].missionName = mission.name;
         return mission;
      });
      this.currentSeason = 'spring';
      this.maxTimeUnits = 28;
      this.currentTimeUnits = this.maxTimeUnits;
      this.consumedTimeUnits = 0;
      this.seasons = {
         spring: { points: 0, endTime: 7, currentTime: 0, missions: ['A', 'B'] },
         summer: { points: 0, endTime: 14, currentTime: 0, missions: ['B', 'C'] },
         autumn: { points: 0, endTime: 21, currentTime: 0, missions: ['C', 'D'] },
         winter: { points: 0, endTime: 28, currentTime: 0, missions: ['D', 'A'] },
      };
      this.currentMissions = this.seasons[this.currentSeason].missions.map((key) => {
         return this.missions[key];
      });
      this.seasonColors = {
         spring: '#508D69',
         summer: '#C51605',
         autumn: '#EC8F5E',
         winter: '#0766AD',
      };
   }

   async initializeInfo() {
      await this.loadMissionImages();
      this.drawMissionImages();
      this.drawInfo();
   }

   async loadMissionImages() {
      if (!this.missionImages) {
         const missionImagesPromises = this.basicMissions.map(
            async (mission) => await mission.getImage()
         );
         this.missionImages = await Promise.all(missionImagesPromises);
      }
   }

   async drawMissionImages() {
      await this.loadMissionImages();
      let offsetY = 0;
      this.currentMissions = this.seasons[this.currentSeason].missions.map((key) => {
         return this.missions[key];
      });

      for (let i = 0; i < this.missionImages.length; i++) {
         const missionImage = this.missionImages[i];
         const mission = new missions.basic[i]();
         const missionName = mission.name;

         const aspectRatio = missionImage.width / missionImage.height;

         const targetImageSize = 300;
         const padding = 10;
         const startY = this.locY + 100;

         let col = i % 2;
         let row = Math.floor(i / 2);

         let rowWidth = targetImageSize * 2 + padding;
         let currentX =
            this.potatoMap.ctx.canvas.width / 2 -
            rowWidth / 2 +
            col * (targetImageSize + padding) +
            300;

         let imageWidth, imageHeight;
         if (aspectRatio >= 1) {
            imageWidth = targetImageSize;
            imageHeight = targetImageSize / aspectRatio;
         } else {
            imageWidth = targetImageSize * aspectRatio;
            imageHeight = targetImageSize;
         }

         this.potatoMap.ctx.drawImage(
            missionImage,
            currentX,
            startY + offsetY + row * (imageHeight + padding),
            imageWidth,
            imageHeight
         );

         const missionProgress =
            Object.values(this.missions).filter((val) => {
               return val.missionName == missionName;
            })[0].points || 0;

         const progressText = `Progress: ${missionProgress}`;
         const textColor = 'white';

         const textWidth = this.potatoMap.ctx.measureText(progressText).width;
         const textX = currentX + imageWidth - textWidth - padding;
         const textY =
            startY + offsetY + row * (imageHeight + padding) + imageHeight - padding;

         this.drawText(progressText, textX, textY, textColor);
      }
   }

   drawInfo() {
      const backgroundColor = '#fff';
      const textColor = '#000';
      const textHeight = 19;
      const totalHeight = Object.keys(this.seasons).length * textHeight;
      const backgroundY = this.locY - 160;
      const bgX = 975;

      this.drawInfoBackground(
         bgX,
         backgroundY,
         300,
         totalHeight + 170,
         5,
         backgroundColor
      );
      const infoX = bgX - 15;

      let yOffset = backgroundY + 2 * textHeight - 15;

      for (const [season, info] of Object.entries(this.seasons)) {
         if (this.seasons[season]) {
            const seasonInfo = `${
               season.charAt(0).toUpperCase() + season.slice(1)
            }: Points - ${info.points || 0}`;
            this.drawText(
               seasonInfo,
               this.locX + infoX,
               yOffset,
               this.seasonColors[season]
            );
            yOffset += textHeight;
         }
      }

      const currentSeasonInfo = this.seasons[this.currentSeason];
      if (currentSeasonInfo) {
         this.drawText(
            `Current Season: ${this.currentSeason}, Points - ${
               currentSeasonInfo.points || 0
            }`,
            this.locX + infoX,
            yOffset + 10,
            this.seasonColors[this.currentSeason]
         );
      }

      yOffset += textHeight * 2;
      this.drawText(
         `Current Time: ${this.consumedTimeUnits}`,
         this.locX + infoX,
         yOffset,
         textColor
      );
      yOffset += textHeight;
      this.drawText(
         `Time Units: ${this.currentTimeUnits}`,
         this.locX + infoX,
         yOffset,
         textColor
      );
      yOffset += textHeight;
      this.drawText(`Current Season Missions`, this.locX + infoX, yOffset, textColor);
      yOffset += textHeight * 2;
      this.currentMissions.forEach((mission) => {
         this.drawText(
            mission.missionName,
            this.locX + infoX,
            yOffset,
            this.seasonColors[this.currentSeason]
         );
         yOffset += textHeight;
      });
   }

   drawInfoBackground(x, y, width, height, cornerRadius, color) {
      this.potatoMap.ctx.font = '10pt "Bree Serif"';
      this.potatoMap.ctx.fillStyle = color;
      this.potatoMap.ctx.beginPath();
      this.potatoMap.ctx.roundRect(x, y, width, height, cornerRadius);
      this.potatoMap.ctx.fill();
   }

   drawText(text, x, y, textColor) {
      this.potatoMap.ctx.font = '12pt "Bree Serif"';
      this.potatoMap.ctx.fillStyle = textColor;
      this.potatoMap.ctx.fillText(text, x, y);
   }

   drawGridBackground() {
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
      for (let row = 0; row < GRID_SIZE; row++) {
         for (let col = 0; col < GRID_SIZE; col++) {
            const tileX = this.locX + (this.tilesW + this.margin) * col + this.margin;
            const tileY = this.locY + (this.tilesH + this.margin) * row + this.margin;
            if (this.isMountain(row, col)) {
               this.tiles[row][col] = await this.drawMountain(tileX, tileY);
            } else {
               this.potatoMap.ctx.drawImage(
                  image,
                  tileX,
                  tileY,
                  this.tilesW,
                  this.tilesH
               );
               if (!this.tiles[row][col])
                  this.tiles[row][col] = new Tile('empty', tileX, tileY);
            }
            this.trackCursor(tileX, tileY, row, col);
         }
      }
   }

   async changeTile(x, y) {
      const tile = this.tiles[x][y];
      if (tile) {
         const name = tile.tileName;
         this.tiles[x][y] = new Tile(name, tile.locX, tile.locY);
         await this.drawTile(
            this.tiles[x][y],
            this.tiles[x][y].locX,
            this.tiles[x][y].locY
         );
      }
   }

   async drawTile(tile, tileX, tileY) {
      const image = await tile.getTileImage();
      this.potatoMap.ctx.drawImage(image, tileX, tileY, this.tilesW, this.tilesH);
      tile.isChanged = true;
   }

   async drawMountain(tileX, tileY) {
      const mountainTile = new Tile('mountain', tileX, tileY);
      const mountainImage = await mountainTile.getTileImage();
      this.potatoMap.ctx.drawImage(mountainImage, tileX, tileY, this.tilesW, this.tilesH);
      return mountainTile;
   }

   isMountain(row, column) {
      return this.mountainSet.has([row + 1, column + 1].join());
   }

   trackCursor(tileX, tileY, row, col) {
      this.potatoMap.canvas.addEventListener('mousemove', (event) => {
         const rect = this.potatoMap.canvas.getBoundingClientRect();
         const x = event.clientX - rect.left;
         const y = event.clientY - rect.top;

         if (
            x >= tileX &&
            x <= tileX + this.tilesW &&
            y >= tileY &&
            y <= tileY + this.tilesH &&
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
      });
   }

   addClickEventListener() {
      this.potatoMap.canvas.addEventListener('click', (event) => {
         const mouseX =
            event.clientX - this.potatoMap.canvas.getBoundingClientRect().left;
         const mouseY = event.clientY - this.potatoMap.canvas.getBoundingClientRect().top;

         if (
            mouseX >= this.locX &&
            mouseX <= this.locX + this.w &&
            mouseY >= this.locY &&
            mouseY <= this.locY + this.h
         ) {
            const selectedCol = Math.floor(
               (mouseX - this.locX) / (this.tilesW + this.margin)
            );
            const selectedRow = Math.floor(
               (mouseY - this.locY) / (this.tilesH + this.margin)
            );

            this.selectedTile = { row: selectedRow, col: selectedCol };

            if (this.currentElement && this.elementGrid) {
               this.placeElement();
            }
         }
      });
   }

   placeElement() {
      if (this.checkIsElementPlacable()) {
         if (!this.calculateTimeDecrement()) return;
         this.consumedTimeUnits += this.currentElement.time;

         this.elementGrid.createRandomElement();
         const { currentElement, selectedTile } = this;
         const gridSize = currentElement.shape.length;

         const tileX =
            this.locX +
            (this.tilesW + this.margin) * (selectedTile.col - 1) +
            this.margin;
         const tileY =
            this.locY +
            (this.tilesH + this.margin) * (selectedTile.row - 1) +
            this.margin;

         for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
               const gridRow = selectedTile.row - 1 + row;
               const gridCol = selectedTile.col - 1 + col;

               if (
                  gridRow >= 0 &&
                  gridRow < this.tiles.length &&
                  gridCol >= 0 &&
                  gridCol < this.tiles[gridRow].length
               ) {
                  if (currentElement.shape[row][col] === 1) {
                     const tile = new Tile(
                        currentElement.type,
                        tileX + col * (this.tilesW + this.margin),
                        tileY + row * (this.tilesH + this.margin)
                     );
                     this.tiles[gridRow][gridCol] = tile;
                  }
               }
            }
         }
      }
   }

   calculateTimeDecrement() {
      if (this.currentElement) {
         if (this.currentTimeUnits < this.currentElement.time) {
            return false;
         }
         const timeRequirement = this.currentElement.time;
         this.currentTimeUnits -= timeRequirement;

         if (this.currentTimeUnits < 0) {
            this.currentTimeUnits = 0;
         }
         return true;
      }
   }

   checkMissionsProgress() {
      let totalPoints = 0;

      if (this.tiles[GRID_SIZE - 1][GRID_SIZE - 1]) {
         const currentSeasonMissions = this.seasons[this.currentSeason].missions;
         console.log(currentSeasonMissions);
         console.log(this.missions);
         currentSeasonMissions.forEach((missionKey) => {
            const mission = this.basicMissions.find(
               (m) => m.name === this.missions[missionKey].missionName
            );
            if (mission) {
               const progress = mission.checkProgress(this.tiles);
               totalPoints += progress;
               this.missions[missionKey].points = progress;
            }
         });

         this.seasons[this.currentSeason].points = this.calculateSeasonPoints(
            this.currentSeason,
            totalPoints
         );
      }
   }

   checkForGameEnd() {
      if (this.currentElement.time > this.currentTimeUnits) return true;
      return false;
   }

   calculateSeasonPoints(season, points) {
      let sharedMissionsPoints = 0;

      const previousSeasons = Object.keys(this.seasons).slice(
         0,
         Object.keys(this.seasons).indexOf(season)
      );
      previousSeasons.forEach((prevSeason) => {
         const sharedMissions = this.seasons[prevSeason].missions.filter((mission) =>
            this.seasons[season].missions.includes(mission)
         );

         sharedMissions.forEach((sharedMission) => {
            sharedMissionsPoints -= this.missions[sharedMission].points;
         });
      });

      const totalPoints =
         this.currentSeason == 'winter' ? points : points + sharedMissionsPoints;
      return totalPoints;
   }

   updateSeasonCycle() {
      for (const season in this.seasons) {
         if (Object.hasOwnProperty.call(this.seasons, season)) {
            const currentSeason = this.seasons[season];
            if (this.currentTimeUnits < this.currentElement.time)
               this.checkMissionsProgress();
            if (season == this.currentSeason) {
               if (currentSeason.endTime < this.consumedTimeUnits) {
                  this.checkMissionsProgress();
                  const seasonsNames = Object.keys(this.seasons);
                  this.currentSeason = seasonsNames[seasonsNames.indexOf(season) + 1];
               }
            }
         }
      }
   }

   checkIsElementPlacable(tile) {
      const { currentElement, tiles, currentTimeUnits } = this;
      const selectedTile = tile || this.selectedTile;
      const gridSize = 3;
      const gridArray = [];
      if (currentElement.time > currentTimeUnits) return false;
      for (let i = 0; i < gridSize; i++) {
         const rowArray = [];
         for (let j = 0; j < gridSize; j++) {
            const rowIndex = selectedTile.row - 1 + i;
            const colIndex = selectedTile.col - 1 + j;

            if (
               rowIndex >= 0 &&
               rowIndex < tiles.length &&
               colIndex >= 0 &&
               colIndex < tiles[rowIndex].length
            ) {
               rowArray.push(tiles[rowIndex][colIndex]);
            } else {
               rowArray.push(null);
            }
         }
         gridArray.push(rowArray);
      }

      for (let row = 0; row < gridSize; row++) {
         for (let col = 0; col < gridSize; col++) {
            const cellValue = currentElement.shape[row][col];
            const tile = gridArray[row][col];

            if (cellValue === 1 && (tile === null || tile.tileName !== 'empty')) {
               return false;
            }
         }
      }
      return true;
   }

   drawPlacementIndicator() {
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

         const tileX =
            this.locX +
            (this.tilesW + this.margin) * (this.selectedTile.col - 1) +
            this.margin;
         const tileY =
            this.locY +
            (this.tilesH + this.margin) * (this.selectedTile.row - 1) +
            this.margin;

         for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
               const cellX = tileX + col * (this.tilesW + this.margin);
               const cellY = tileY + row * (this.tilesH + this.margin);
               const cellWidth = this.tilesW;
               const cellHeight = this.tilesH;

               if (
                  cellX >= this.locX &&
                  cellX + cellWidth <= this.locX + this.w &&
                  cellY >= this.locY &&
                  cellY + cellHeight <= this.locY + this.h
               ) {
                  if (currentElement.shape[row][col] === 1) {
                     this.potatoMap.ctx.beginPath();
                     this.potatoMap.ctx.lineWidth = 2;
                     const strokeStyle = this.checkIsElementPlacable()
                        ? 'green'
                        : currentElement.time > this.currentTimeUnits
                        ? 'gray'
                        : 'red';
                     this.potatoMap.ctx.strokeStyle = strokeStyle;
                     this.potatoMap.ctx.rect(
                        cellX - 1,
                        cellY - 1,
                        cellWidth + 1,
                        cellHeight + 1
                     );
                     this.potatoMap.ctx.stroke();
                  }
               }
            }
         }
      }
   }

   clearIndicator() {
      this.potatoMap.ctx.strokeStyle = 'white';

      for (let row = 0; row < GRID_SIZE; row++) {
         for (let col = 0; col < GRID_SIZE; col++) {
            const tile = this.tiles[row][col];
            if (tile) {
               const tileX = tile.locX;
               const tileY = tile.locY;
               const cellWidth = this.tilesW;
               const cellHeight = this.tilesH;

               this.potatoMap.ctx.beginPath();
               this.potatoMap.ctx.lineWidth = 2;
               this.potatoMap.ctx.rect(
                  tileX - 1,
                  tileY - 1,
                  cellWidth + 1,
                  cellHeight + 1
               );
               this.potatoMap.ctx.stroke();
            }
         }
      }
   }

   async updateTiles() {
      this.potatoMap.ctx.globalCompositeOperation = 'source-over';
      for (let row = 0; row < GRID_SIZE; row++) {
         for (let col = 0; col < GRID_SIZE; col++) {
            const tile = this.tiles[row][col];

            if (tile && tile.isChanged) {
               await this.changeTile(col, row);
               tile.isChanged = false;
            }
         }
      }
   }
}
