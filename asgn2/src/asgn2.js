// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
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

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return; 
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return; 
  }

  // set identity
  let identityMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMatrix.elements); // set
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
  
  renderAllShapes();
}

var g_shapes_list = [];

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selected_color = [1.0, 1.0, 1.0, 1.0];
let g_selected_size= 10;
let g_selected_type = POINT;
let g_globalAngle = 0;

function addActionsForHtmlUI() {

  // Clear button event
  document.getElementById('clear-button').addEventListener('mousedown', (e) => { gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); });
  
  // Paint picture event
  document.getElementById('paint-button').addEventListener('mousedown', (e) => { drawPicture() });
  
  // Camera angle slider events
  document.getElementById('camera-angle-slider').addEventListener('mousemove', (e) => { 
    g_globalAngle = e.currentTarget.value; renderAllShapes(); });
}

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


// global joint angles 
let kneeRightAngle = 55;

function renderAllShapes() {

  // Pass rotation matrix to u_GlobalRotateMatrix
  let globalRotateMatrix = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // draw body cube 
  let body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.setTranslate(-0.4, 0, 0);
  body.matrix.scale(0.8, 0.3, 0.5);
  body.render();

  // draw head cubes
  let head1 = new Cube();
  head1.color = [1.0, 0.8, 0.6, 1.0];
  head1.matrix.setTranslate(0.4, 0.28, 0);
  head1.matrix.scale(0.2, 0.15, 0.5);
  head1.render();

  let jawUp = new Cube();
  jawUp.color = [1.0, 0.8, 0.3, 1.0];
  jawUp.matrix.setTranslate(0.4, 0.18, 0);
  jawUp.matrix.scale(0.6, 0.1, 0.5);
  jawUp.render();

  let jawBottom = new Cube();
  jawBottom.color = [0.0, 0.8, 0.0, 1.0];
  jawBottom.matrix.setTranslate(0.39, 0.08, 0);
  jawBottom.matrix.rotate(-5, 0, 0, 1)
  jawBottom.matrix.scale(0.6, 0.1, 0.5);
  jawBottom.render();

  // draw tail 
  let tail1 = new Cube();
  tail1.color = [1.0,1.0,0.0,1.0];
  tail1.matrix.setTranslate(-0.6, 0.1, 0);
  tail1.matrix.scale(0.2, 0.2, 0.5);
  tail1.render();

  let tail2 = new Cube();
  tail2.color = [1.0,0.5,0.0,1.0];
  tail2.matrix.setTranslate(-0.8, 0.12, 0.05);
  tail2.matrix.scale(0.2, 0.15, 0.4);
  tail2.render();

  let tail3 = new Cube();
  tail3.color = [0.0,0.5,0.0,1.0];
  tail3.matrix.setTranslate(-1, 0.13, 0.1);
  tail3.matrix.scale(0.2, 0.11, 0.3);
  tail3.render();

  // draw legs 
  leg1 = new Cube();
  leg1.color = [0.5,0.35,0.05,1.0];
  leg1.matrix.setTranslate(-0.25, -0.1, -0.10);
  leg1.matrix.rotate(25, 0, 1, 0);
  leg1.matrix.rotate(55, 0, 0, 1);
  leg1.matrix.scale(0.10, 0.20, 0.07);
  leg1.render();

  foreleg1 = new Cube();
  foreleg1.color = [0.5,0.25,0.05,1.0];
  foreleg1.matrix.setTranslate(-0.32, -0.1, -0.08);
  foreleg1.matrix.rotate(20, 0, 1, 0);
  foreleg1.matrix.rotate(-35, 0, 0, 1);
  foreleg1.matrix.scale(0.10, 0.15, 0.07);
  foreleg1.render();
  
  foot1 = new Cube();
  foot1.color = [0.3,0.15,0.02,1.0];
  foot1.matrix.setTranslate(-0.36, -0.13, -0.06);
  foot1.matrix.rotate(15, 0, 1, 0);
  foot1.matrix.rotate(-35, 0, 0, 1);
  foot1.matrix.scale(0.15, 0.05, 0.07);
  foot1.render();

  leg2 = new Cube();
  leg2.color = [0.5,0.35,0.05,1.0];
  leg2.matrix.setTranslate(-0.25, -0.1, 0.5);
  leg2.matrix.rotate(-25, 0, 1, 0);
  leg2.matrix.rotate(55, 0, 0, 1);
  leg2.matrix.scale(0.10, 0.20, 0.07);
  leg2.render();

  foreleg2 = new Cube();
  foreleg2.color = [0.5,0.25,0.05,1.0];
  foreleg2.matrix.setTranslate(-0.32, -0.1, 0.48);
  foreleg2.matrix.rotate(-20, 0, 1, 0);
  foreleg2.matrix.rotate(-35, 0, 0, 1);
  foreleg2.matrix.scale(0.10, 0.15, 0.07);
  foreleg2.render();  

  foot2 = new Cube();
  foot2.color = [0.3,0.15,0.02,1.0];
  foot2.matrix.setTranslate(-0.36, -0.13, 0.46);
  foot2.matrix.rotate(-15, 0, 1, 0);
  foot2.matrix.rotate(-35, 0, 0, 1);
  foot2.matrix.scale(0.15, 0.05, 0.07);
  foot2.render();

  arm1 = new Cube();
  arm1.color = [0.5,0.35,0.05,1.0];
  arm1.matrix.setTranslate(0.1, -0.05, -0.07);
  arm1.matrix.rotate(-30, 0, 0, 1);
  arm1.matrix.scale(0.10, 0.18, 0.07);
  arm1.render();

  forearm1 = new Cube();
  forearm1.color = [0.5,0.25,0.05,1.0];
  forearm1.matrix.setTranslate(0.15, -0.18, -0.07);
  forearm1.matrix.rotate(15, 0, 0, 1);
  forearm1.matrix.scale(0.10, 0.13, 0.07);
  forearm1.render();  

  hand1 = new Cube();
  hand1.color = [0.3,0.15,0.02,1.0];
  hand1.matrix.setTranslate(0.15, -0.22, -0.07);
  hand1.matrix.rotate(15, 0, 0, 1);
  hand1.matrix.scale(0.15, 0.05, 0.07);
  hand1.render();

  arm2 = new Cube();
  arm2.color = [0.5,0.35,0.05,1.0];
  arm2.matrix.setTranslate(0.1, -0.05, 0.5);
  arm2.matrix.rotate(-30, 0, 0, 1);
  arm2.matrix.scale(0.10, 0.18, 0.07);
  arm2.render();  

  forearm2 = new Cube();
  forearm2.color = [0.5,0.25,0.05,1.0];
  forearm2.matrix.setTranslate(0.15, -0.18, 0.5);
  forearm2.matrix.rotate(15, 0, 0, 1);
  forearm2.matrix.scale(0.10, 0.13, 0.07);
  forearm2.render();

  hand2 = new Cube();
  hand2.color = [0.3,0.15,0.02,1.0];
  hand2.matrix.setTranslate(0.15, -0.22, 0.5);
  hand2.matrix.rotate(15, 0, 0, 1);
  hand2.matrix.scale(0.15, 0.05, 0.07);
  hand2.render();
}


// extra
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