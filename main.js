import Grid from './classes/Grid.js';
import PotatoMap from './classes/PotatoMap.js';

const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

const potatoMap = new PotatoMap(canvas, ctx);
potatoMap.drawBackground();

const grid = new Grid(potatoMap, 50, 50, 40, 170);

grid.createGrid()
