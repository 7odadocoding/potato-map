import ElementGrid from './classes/ElementGrid.js';
import PotatoMap from './classes/PotatoMap.js';

const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

async function gameLoop() {
   const potatoMap = new PotatoMap(canvas, ctx);
   const grid = potatoMap.grid;
   await potatoMap.drawBackground();

   const elementGrid = new ElementGrid(ctx, grid);
   await elementGrid.preloadTileImages(); // Preload tile images
   grid.createGrid();
   grid.drawInfo();
   elementGrid.drawElementGrid();

   async function update() {
      // if (!isWindowFocused) {
      //    return;
      // }
      await potatoMap.startGame()
      elementGrid.updateCells();
      elementGrid.drawRoundedRectangle();
      elementGrid.updateCells();
      requestAnimationFrame(update);
   }

   await update();
}

gameLoop();
