import Grid from './Grid.js';

class Storage {
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

   initializeGame() {
      // Check if there's saved progress
      const savedData = Storage.loadData('potatoMapData');
      if (savedData) {
         this.restoreSavedProgress(savedData);
      } else {
         this.initializeNewGame();
      }

      this.startGame();
   }

   initializeNewGame() {
      // Initialize the game as usual
      this.grid.missions = {
         A: { points: 0, missionName: '' },
         B: { points: 0, missionName: '' },
         C: { points: 0, missionName: '' },
         D: { points: 0, missionName: '' },
      };

      this.grid.basicMissions = missions.basic.map((Mission, i) => {
         const mission = new Mission();
         this.grid.missions[Object.keys(this.grid.missions)[i]].missionName =
            mission.name;
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

      // Save the initial state to localStorage
      Storage.saveData('potatoMapData', this.getState());
   }

   restoreSavedProgress(savedData) {
      // Restore the game state from the saved data
      this.grid.missions = savedData.missions;
      this.grid.basicMissions = savedData.basicMissions;
      this.grid.currentSeason = savedData.currentSeason;
      this.grid.maxTimeUnits = savedData.maxTimeUnits;
      this.grid.currentTimeUnits = savedData.currentTimeUnits;
      this.grid.consumedTimeUnits = savedData.consumedTimeUnits;
      this.grid.seasons = savedData.seasons;

      // Optionally, update any additional properties based on the saved data
      // ...

      // Update the grid, missions, or other components based on the saved data
      // ...

      // You might want to update the UI or perform additional actions
      // ...

      // Save the restored state back to localStorage (optional)
      Storage.saveData('potatoMapData', this.getState());
   }

   initializeGrid() {
      this.createGrid();
   }

   initializeMissions() {
      this.initializeInfo();
   }

   async startGame() {
      if (this.grid.checkForGameEnd()) {
         // Display game end information and reset button
         return;
      }
      Storage.saveData('potatoMapData', this.getState());
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
         basicMissions: this.grid.basicMissions,
         currentSeason: this.grid.currentSeason,
         maxTimeUnits: this.grid.maxTimeUnits,
         currentTimeUnits: this.grid.currentTimeUnits,
         consumedTimeUnits: this.grid.consumedTimeUnits,
         seasons: this.grid.seasons,
         // ... other properties
      };
   }
}
