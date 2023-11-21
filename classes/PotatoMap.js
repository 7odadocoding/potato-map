import Grid from './Grid.js';

export class Storage {
   static saveData(key, data) {
      localStorage.setItem(key, JSON.stringify(data));
   }

   static loadData(key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
   }

   static clearData(key) {
      localStorage.removeItem(key);
   }
}

export default class PotatoMap {
   constructor(canvas, ctx, width = 1347, height = 911, bg = './assets/theme.png') {
      this.width = width;
      this.height = height;
      this.canvas = canvas;
      this.ctx = ctx;
      this.bg = bg;
      this.image = new Image();
      this.grid = new Grid(this, 50, 50, 40, 170);
      canvas.width = width;
      canvas.height = height;
   }

   async initializeNewGame() {
      await this.grid.createGrid();
      this.initializeGrid();
      this.initializeMissions();

      // Save the initial state to localStorage
      Storage.saveData('potatoMapData', this.getState());
   }

   async restoreSavedProgress(savedData) {
      // Restore the game state from the saved data
      this.grid.missions = savedData.missions;
      this.grid.currentSeason = savedData.currentSeason;
      this.grid.maxTimeUnits = savedData.maxTimeUnits;
      this.grid.currentTimeUnits = savedData.currentTimeUnits;
      this.grid.consumedTimeUnits = savedData.consumedTimeUnits;
      this.grid.seasons = savedData.seasons;
      this.grid.tiles = savedData.tiles;

      await this.grid.createGrid();

      Storage.saveData('potatoMapData', this.getState());
   }

   initializeGrid() {
      this.grid.createGrid();
   }

   initializeMissions() {
      this.grid.initializeInfo();
   }

   async startGame() {
      if (this.grid.checkForGameEnd()) {
         // Display game end information and reset button
         Storage.clearData('potatoMapData');
      } else {
         Storage.saveData('potatoMapData', this.getState());
      }
      await this.grid.updateTiles();
      this.grid.updateSeasonCycle();
      this.grid.initializeInfo();
   }

   async drawBackground() {
      await this.getImage();
      this.ctx.drawImage(this.image, 0, 0);
      this.ctx.fillStyle = '#00000070';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#ffffff70';
      this.ctx.fillRect(0, 0, this.width, this.height);
   }

   getImage() {
      return new Promise((resolve, reject) => {
         this.image.onload = () => resolve(this.image);
         this.image.src = this.bg;
      });
   }

   getState() {
      // Return the current state of the game that needs to be saved
      return {
         missions: this.grid.missions,
         currentSeason: this.grid.currentSeason,
         maxTimeUnits: this.grid.maxTimeUnits,
         currentTimeUnits: this.grid.currentTimeUnits,
         consumedTimeUnits: this.grid.consumedTimeUnits,
         seasons: this.grid.seasons,
         tiles: this.grid.tiles,
      };
   }
}
