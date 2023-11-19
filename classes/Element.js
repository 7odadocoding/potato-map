import Tile from './Tile.js';

export default class Element {
   constructor(
      time,
      type,
      shape = [
         [0, 0, 0],
         [0, 0, 0],
         [0, 0, 0],
      ]
   ) {
      this.time = time;
      this.type = type;
      this.shape = shape;
      this.rotation = 0;
      this.isMirror = false;
      this.tileImages = {};
   }

   drawElement(ctx, x, y, cellWidth, cellHeight, cellMargin, tileImages) {
      ctx.fillStyle = 'black';
      ctx.font = '16pt "Bree Serif"';
      ctx.fillText(this.time, x + cellWidth * 3, y - 8);
      for (let row = 0; row < this.shape.length; row++) {
         for (let col = 0; col < this.shape[row].length; col++) {
            ctx.fillStyle = 'white';
            const elementX = x + col * (cellWidth + cellMargin) + cellMargin;
            const elementY = y + row * (cellHeight + cellMargin) + cellMargin;
            if (this.shape[row][col]) {
               // Draw the preloaded tile image
               ctx.drawImage(
                  tileImages[this.type],
                  elementX,
                  elementY,
                  cellWidth,
                  cellHeight
               );
            } else {
               ctx.fillRect(elementX, elementY, cellWidth, cellHeight);
            }
         }
      }
   }

   rotate() {
      const { shape } = this;
      const newShape = shape[0].map((val, index) =>
         shape.map((row) => row[index]).reverse()
      );
      this.shape = newShape;
      this.rotation = (this.rotation + 1) % 4;

      // console.log(this.shape); // Log the updated shape
      // console.log(this.rotation);
   }

   mirror() {
      const { shape } = this;
      console.log(shape);
      const newShape = shape.map((row) => row.reverse());
      this.shape = newShape;
      this.isMirror = !this.isMirror;

      // console.log(this.shape); // Log the updated shape
      // console.log(this.isMirror);
   }
}
