import Grid from './Grid.js';

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

   initializeGame() {
      this.grid.missions = { A: { points: 0, missionName: '' }, B: { points: 0, missionName: '' }, C: { points: 0, missionName: '' }, D: { points: 0, missionName: '' } };

      this.grid.basicMissions = missions.basic.map((Mission, i) => {
         const mission = new Mission();
         this.grid.missions[Object.keys(this.grid.missions)[i]].missionName = mission.name;
         return mission;
      });

      this.grid.currentSeason = 'spring';
      this.grid.maxTimeUnits = 28;
      this.grid.currentTimeUnits = this.grid.maxTimeUnits;
      this.grid.consumedTimeUnits = 0;

      this.grid.seasons = {
         spring: { points: 0, endTime: 7, currentTime: 0, missions: ['A', 'B'] },
         summer: { points: 0, endTime: 14, currentTime: 0, missions: ['B', 'C'] },
         autumn: { points: 0, endTime: 21, currentTime: 0, missions: ['C', 'D'] },
         winter: { points: 0, endTime: 28, currentTime: 0, missions: ['D', 'A'] },
      };

      this.initializeGrid();
      this.initializeMissions();
      this.startGame();
   }

   initializeGrid() {
      this.createGrid();
   }

   initializeMissions() {
      this.initializeInfo();
   }

   async startGame() {
      await this.grid.updateTiles();
      this.grid.updateSeasonCycle();
      this.grid.initializeInfo();
      if (this.grid.checkForGameEnd()) {
         // Display game end information and reset button
      }
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
}
