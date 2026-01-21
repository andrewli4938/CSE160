// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
    // gl_PointSize = 10;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = (ev) => { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapes_list = [];

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selected_color = [1.0, 1.0, 1.0, 1.0];
let g_selected_size= 10;
let g_selected_segments = 10;
let g_selected_type = POINT;

function addActionsForHtmlUI() {
  // Play game button event
  document.getElementById('game-button').addEventListener('mousedown', (e) => { startGame(100) });
  document.getElementById('game-end-button').addEventListener('mousedown', (e) => { endGame() });

  // Clear button event
  document.getElementById('clear-button').addEventListener('mousedown', (e) => { g_shapes_list = []; renderAllShapes();});
  
  // Paint picture event
  document.getElementById('paint-button').addEventListener('mousedown', (e) => { drawPicture() });

  // Shape selector buttons
  document.getElementById('squares-button').addEventListener('mousedown', (e) => { g_selected_type = POINT });
  document.getElementById('triangles-button').addEventListener('mousedown', (e) => { g_selected_type = TRIANGLE });
  document.getElementById('circles-button').addEventListener('mousedown', (e) => { g_selected_type = CIRCLE });

  // Color slider events
  document.getElementById('red-slider').addEventListener('mouseup', (e) => { g_selected_color[0] = e.currentTarget.value });
  document.getElementById('green-slider').addEventListener('mouseup', (e) => { g_selected_color[1] = e.currentTarget.value });
  document.getElementById('blue-slider').addEventListener('mouseup', (e) => { g_selected_color[2] = e.currentTarget.value });

  // Size slider events
  document.getElementById('shape-size-slider').addEventListener('mouseup', (e) => { g_selected_size = e.currentTarget.value });
  
  // Segment slider event
  document.getElementById('segment-count-slider').addEventListener('mouseup', (e) => { g_selected_segments = e.currentTarget.value });
}

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];

function click(ev) {
  
  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selected_type==POINT) {
    point = new Point();
  } else if (g_selected_type==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selected_segments;
  }

  point.position = [x, y];
  point.color = g_selected_color.slice();
  point.size = g_selected_size;
  g_shapes_list.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x, y];
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapes_list.length;
  for(var i = 0; i < len; i++) {
    g_shapes_list[i].render();
  }
}

function setColor([r, g, b, a]) {
  gl.uniform4f(u_FragColor, r, g, b, a);
}

const RED = [1.0, 0.0, 0.0, 1.0];
const GREEN = [0.0, 0.5, 0.0, 1.0];
const PURPLE = [0.5, 0.0, 0.5, 1.0];
const BLACK = [0.0, 0.0, 0.0, 1.0];


function drawPicture() {
  // butt
  setColor(PURPLE);
  drawTriangle([-0.8, 0.0,  -0.8, 0.2,  -0.9, 0.1]);
  drawTriangle([-0.8, 0.0,  -0.8, -0.2,   -0.9, -0.1]);
  
  drawTriangle([-0.8, 0.2,  -0.8, -0.2,   -0.6, -0.2]);
  drawTriangle([-0.8, 0.2,   -0.6, 0.2,   -0.6, -0.2]);
  
  drawTriangle([-0.8, 0.2,  -0.6, 0.2,  -0.6, 0.4]);
  drawTriangle([-0.8, -0.2,  -0.6, -0.2,  -0.6, -0.4]);
  
  // body
  drawTriangle([-0.6, 0.4,  -0.6, -0.4,   0.2, -0.4]);
  drawTriangle([-0.6, 0.4,  0.2, 0.4,   0.2, -0.4]);
  
  // head
  drawTriangle([0.2, 0.4,   0.2, 0.2,   0.6, 0.2]);
  drawTriangle([0.2, 0.2,   0.6, 0.2,   0.6, -0.2]);
  drawTriangle([0.6, -0.2,  0.2, -0.2,  0.2, 0.2]);
  
  // mouth
  drawTriangle([0.2, -0.2,  0.2, -0.4,  0.55, -0.3]);
  drawTriangle([0.2, -0.2,  0.6, -0.2,  0.55, -0.25]);
  
  // top fin
  setColor(GREEN);
  drawTriangle([-0.6, 0.4,  -0.2, 0.4,  -0.4, 0.5]);
  drawTriangle([-0.4, 0.5, -0.2, 0.4,   0, 0.5]);
  drawTriangle([-0.2, 0.4,  0, 0.5,   0.2, 0.4]);
  
  // tail
  drawTriangle([-1.0, 0.0,  -0.8, 0.0,  -1.0, 0.2]);
  drawTriangle([-1.0, 0.0,  -0.8, 0.0,  -1.0, -0.2]);

  // side fin
  drawTriangle([-0.2, -0.1,   -0.2, -0.2,  -0.38, -0.15]);

  // eye
  setColor(BLACK);
  drawTriangle([0.4, 0.04,  0.4, 0.08,  0.45, 0.06]);
}



function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let target_offset;
let target_x;
let target_y;
let score = 0;
function startGame(size) {
  document.getElementById('game-results').hidden = true;
  document.getElementById('game-start').hidden = true;
  document.getElementById('game-end').hidden = true;
  // get a random position on the canvas
  target_x = randomNum(-1, 1);
  target_y = randomNum(-1, 1);
  
  // define the target area
  target_offset = size/100.0;
  canvas.onmousedown = gameClick;

  document.getElementById('game-start').hidden = false;
}

function endGame() {
  canvas.onmousedown = click;
  document.getElementById('game-results').hidden = true;
  document.getElementById('game-start').hidden = true;
  document.getElementById('game-end').hidden = false;
  score = 0;
}

function gameClick(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);
  if (x > target_x-target_offset && x < target_x+target_offset && y > target_y-target_offset && y < target_y+target_offset) {
    let score_text = document.getElementById('score-text')
    score_text.textContent = score;

    document.getElementById('game-results').hidden = false;

    canvas.onmousedown = click;
  }
  
  score += 1;
}