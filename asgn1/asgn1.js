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
  // Clear button event
  document.getElementById('clear-button').addEventListener('mousedown', (e) => { g_shapes_list = []; renderAllShapes();});

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