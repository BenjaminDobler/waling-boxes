import { animationFrameScheduler, fromEvent, interval, merge, of } from 'rxjs';

import Stats from 'stats.js';
import { ThreeRenderer } from './renderer/3d/threejs.renderer';

const height = 700;
const width = 1360;



const stats = new Stats();
document.body.appendChild(stats.dom);

const container = document.getElementById('container');

let canvas;

function newCanvas() {
    if (canvas) {
        container.removeChild(canvas);
    }
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.setAttribute('width', width + '');
    canvas.setAttribute('height', height + '');
    container.appendChild(canvas);
}

newCanvas();

const renderer = new ThreeRenderer();
renderer.init(canvas, width, height);

const $tick = interval(1000 / 60, animationFrameScheduler);

$tick.subscribe(() => {
    stats.begin();
    renderer.render();
    stats.end();
});




