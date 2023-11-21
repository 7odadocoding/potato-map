import ElementGrid from './classes/ElementGrid.js';
import PotatoMap, { Storage } from './classes/PotatoMap.js';

const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

let isWindowFocused = true;

document.addEventListener('focusout', () => {
   isWindowFocused = false;
});
document.addEventListener('focusin', () => {
   isWindowFocused = true;
});

async function gameLoop() {
   const potatoMap = new PotatoMap(canvas, ctx);
   const grid = potatoMap.grid;
   await potatoMap.drawBackground();

   const elementGrid = new ElementGrid(ctx, grid);
   await elementGrid.preloadTileImages(); // Preload tile images
   grid.drawInfo();
   elementGrid.drawElementGrid();

   const savedData = Storage.loadData('potatoMapData');
   if (savedData) {
      await potatoMap.restoreSavedProgress(savedData);
   } else {
      await potatoMap.initializeNewGame();
   }

   async function update() {
      if (!isWindowFocused) {
         return;
      }
      await potatoMap.startGame();
      elementGrid.updateCells();
      elementGrid.drawRoundedRectangle();
      elementGrid.updateCells();
      requestAnimationFrame(update);
   }

   await update();
}

gameLoop();
