
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
    
// setup stats.js panel 
var stats = new Stats();

// move panel to right side instead of left
// cuz our canvas will be covered
stats.dom.style.left = "auto";
stats.dom.style.right = "0";
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);


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
  canvas.onmousedown = (ev) => {
     if (ev.shiftKey) { 
      ev.preventDefault(); 
      poke();
      console.log("SHIFTCLICK"); 
    } 
    
    click(ev);
  };

  // canvas.onmousedown = click;
  canvas.onmousemove = (ev) => { if (ev.buttons == 1) { click(ev); g_dragging = true } else { g_dragging = false }};


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // draw the scene
  // renderAllShapes();
  tick();
}

g_startTime = performance.now()/1000.0;
g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {

  g_seconds = performance.now()/1000.0 - g_startTime;
  // console.log(g_seconds);

  stats.begin();
  updateAnimationAngles();
  renderAllShapes();
  stats.end();

  requestAnimationFrame(tick);
}

let g_animating = false;
let g_dragging = false;
let g_poke = false;
function updateAnimationAngles() {
  if (g_animating) {
    const w = 2 * Math.PI * 1.2; // 1.2 cycles per second

    g_hipAngle = (Math.sin(g_seconds*w)*30);
    g_kneeAngle = (Math.sin(g_seconds*w + 1.2)*30);
    g_ankleAngle = (-Math.sin(g_seconds*w + 2)*30);  

    g_shoulderAngle = (-Math.sin(g_seconds*w + Math.PI)*20);
    g_elbowAngle = (Math.sin(g_seconds*w + Math.PI + 1.2)*20);
    g_wristAngle = (Math.sin(g_seconds*w + Math.PI + 2)*10); 

    g_tailAngle = (Math.sin(g_seconds*w)*7);

    g_jawAngle = (Math.sin(g_seconds*w)*7);
  } else if (g_poke) {
    
  }
}


// Globals related to UI elements
let g_globalAngle = 0;
let g_mouseRotX = 0;
let g_mouseRotY = 0;
function addActionsForHtmlUI() {    
  // Camera angle slider events
  document.getElementById('camera-angle-slider').addEventListener('mousemove', (e) => { 
    g_globalAngle = e.currentTarget.value; renderAllShapes(); });

  // Joint angle slider events
  document.getElementById('hip-angle-slider').addEventListener('mousemove', (e) => {
    g_hipAngle = e.currentTarget.value; renderAllShapes();  });

  document.getElementById('knee-angle-slider').addEventListener('mousemove', (e) => {
    g_kneeAngle = e.currentTarget.value; renderAllShapes();  });
    
  document.getElementById('ankle-angle-slider').addEventListener('mousemove', (e) => {
    g_ankleAngle = e.currentTarget.value; renderAllShapes();  });

  document.getElementById('shoulder-angle-slider').addEventListener('mousemove', (e) => {
    g_shoulderAngle = e.currentTarget.value; renderAllShapes();  });

  document.getElementById('elbow-angle-slider').addEventListener('mousemove', (e) => {
    g_elbowAngle = e.currentTarget.value; renderAllShapes();  });

  document.getElementById('wrist-angle-slider').addEventListener('mousemove', (e) => {
    g_wristAngle = e.currentTarget.value; renderAllShapes();  }); 

  // animation buttons
  document.getElementById('animate-on').addEventListener('mousedown', (e) => { g_animating = true; });
  document.getElementById('animate-off').addEventListener('mousedown', (e) => { g_animating = false; });
}

function click(ev) {
  
  let [x, y] = convertCoordinatesEventToGL(ev);
  g_mouseRotY = -x * 180;   
  g_mouseRotX = y * 90;   

  renderAllShapes();
}

function poke() {
  g_poke = true;
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
g_pokeHead = 0;
g_pokeTail = 0;

let g_hipAngle = 0;
let g_kneeAngle = 0; 
let g_ankleAngle = 0;
let g_shoulderAngle = 0;
let g_elbowAngle = 0;
let g_wristAngle = 0;
let g_tailAngle = 0;
let g_jawAngle = 0;
function renderAllShapes() {

  // Pass rotation matrix to u_GlobalRotateMatrix
  let globalRotateMatrix = new Matrix4();
  if (g_dragging) {
    globalRotateMatrix.rotate(g_mouseRotX, 1, 0, 0);
    globalRotateMatrix.rotate(g_mouseRotY, 0, 1, 0); 
  } else {
    globalRotateMatrix.rotate(g_globalAngle, 0, 1, 0);
  }
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  let cyl= new Cylinder();
  cyl.color = [1, 0, 0, 1];
  cyl.matrix.translate(0, -0.5, 0);
  cyl.matrix.scale(1, 2, 1);
  cyl.render();

  // draw body cube 
  let body = new Cube();
  body.color = [0.22, 0.32, 0.20, 1.0];
  body.matrix.translate(-0.4, 0, 0);
  body.matrix.scale(0.8, 0.3, 0.5);
  body.render();

  // draw head cubes
  let head1 = new Cube();
  head1.color = [0.16, 0.22, 0.13, 1.0];
  head1.matrix.setTranslate(0.4, 0.28, 0);
  head1.matrix.rotate(g_jawAngle, 0, 0, 1);
  head1.matrix.scale(0.2, 0.15, 0.5);
  head1.render();

  let jawUp = new Cube();
  jawUp.color = [0.16, 0.22, 0.13, 1.0];
  jawUp.matrix.setTranslate(0.4, 0.18, 0);
  jawUp.matrix.rotate(g_jawAngle, 0, 0, 1);
  jawUp.matrix.scale(0.6, 0.1, 0.5);
  jawUp.render();

  let jawBottom = new Cube();
  jawBottom.color = [0.16, 0.22, 0.13, 1.0];
  jawBottom.matrix.setTranslate(0.39, 0.08, 0);
  jawBottom.matrix.rotate(g_jawAngle, 0, 0, 1);
  jawBottom.matrix.rotate(-5, 0, 0, 1)
  jawBottom.matrix.scale(0.6, 0.1, 0.5);
  jawBottom.render();

  // draw tail 
  let tail1 = new Cube();
  tail1.color = [0.18, 0.24, 0.14, 1.0];
  tail1.matrix.setTranslate(-0.4, 0.1, 0);
  tail1.matrix.rotate(g_tailAngle, 0, 1, 0);
  tail1.matrix.translate(-0.2, 0, 0);
  let tail1CoordinatesMat = new Matrix4(tail1.matrix);
  tail1.matrix.scale(0.2, 0.2, 0.5);
  tail1.render();

  let tail2 = new Cube();
  tail2.color = [0.18, 0.24, 0.14, 1.0];
  tail2.matrix = tail1CoordinatesMat;
  tail2.matrix.translate(0, 0.03, 0.05);
  tail2.matrix.rotate(g_tailAngle, 0, 1, 0);
  tail2.matrix.translate(-0.2, 0, 0);
  let tail2CoordinatesMat = new Matrix4(tail2.matrix);
  tail2.matrix.scale(0.2, 0.15, 0.4);
  tail2.render();

  let tail3 = new Cube();
  tail3.color = [0.18, 0.24, 0.14, 1.0];
  tail3.matrix = tail2CoordinatesMat;
  tail3.matrix.translate(0, 0.02, 0.05);
  tail3.matrix.rotate(-g_tailAngle, 0, 1, 0);
  tail3.matrix.translate(-0.2, 0, 0);
  tail3.matrix.scale(0.2, 0.11, 0.3);
  tail3.render();

  // draw legs 
  let legH = 0.2;
  let leg1 = new Cube();
  leg1.color = [0.18, 0.26, 0.16, 1.0];
  leg1.matrix.setTranslate(-0.4, -0.2, -0.07);
  leg1.matrix.translate(0, legH, 0);          
  leg1.matrix.rotate(g_hipAngle, 0, 0, 1);  
  leg1.matrix.rotate(55, 0, 0, 1);
  leg1.matrix.translate(0, -legH, 0);        
  let leg1CoordinatesMat = new Matrix4(leg1.matrix);
  leg1.matrix.scale(0.10, legH, 0.07);
  leg1.render();


  foreleg1 = new Cube();
  foreleg1.color = [0.18, 0.26, 0.16, 1.0];
  foreleg1.matrix = leg1CoordinatesMat;
  foreleg1.matrix.translate(0.1, -0.08, 0.01);
  foreleg1.matrix.translate(0, 0.15, 0);
  foreleg1.matrix.rotate(-g_kneeAngle, 0, 0, 1);
  foreleg1.matrix.rotate(-90, 0, 0, 1);
  foreleg1.matrix.translate(0, -0.15, 0);
  let foreleg1CoordinatesMat = new Matrix4(foreleg1.matrix);
  foreleg1.matrix.scale(0.10, 0.15, 0.07);
  foreleg1.render();
  
  foot1 = new Cube();
  foot1.color = [0.3,0.15,0.02,1.0];
  foot1.matrix = foreleg1CoordinatesMat;
  foot1.matrix.rotate(-g_ankleAngle, 0, 0, 1);
  foot1.matrix.translate(0, -0.02, 0.01);
  foot1.matrix.scale(0.15, 0.05, 0.07);
  foot1.render();

  leg2 = new Cube();
  leg2.color = [0.18, 0.26, 0.16, 1.0];
  leg2.matrix.setTranslate(-0.4, -0.2, 0.5);
  leg2.matrix.translate(0, legH, 0);          
  leg2.matrix.rotate(-g_hipAngle, 0, 0, 1);
  leg2.matrix.rotate(55, 0, 0, 1);
  leg2.matrix.translate(0, -legH, 0);
  let leg2CoordinatesMat = new Matrix4(leg2.matrix);
  leg2.matrix.scale(0.10, 0.20, 0.07);
  leg2.render();

  foreleg2 = new Cube();
  foreleg2.color = [0.18, 0.26, 0.16, 1.0];
  foreleg2.matrix = leg2CoordinatesMat;
  foreleg2.matrix.translate(0.1, -0.08, 0.01);
  foreleg2.matrix.translate(0, 0.15, 0);
  foreleg2.matrix.rotate(g_kneeAngle, 0, 0, 1);
  foreleg2.matrix.rotate(-90, 0, 0, 1);
  foreleg2.matrix.translate(0, -0.15, 0);
  let foreleg2CoordinatesMat = new Matrix4(foreleg2.matrix);
  foreleg2.matrix.scale(0.10, 0.15, 0.07);
  foreleg2.render();  

  foot2 = new Cube();
  foot2.color = [0.3,0.15,0.02,1.0];
  foot2.matrix = foreleg2CoordinatesMat;
  foot2.matrix.rotate(g_ankleAngle, 0, 0, 1);
  foot2.matrix.rotate(0, 0, 0, 1);
  foot2.matrix.scale(0.15, 0.05, 0.07);
  foot2.render();

  armH = 0.18;
  arm1 = new Cube();
  arm1.color = [0.18, 0.26, 0.16, 1.0];
  arm1.matrix.setTranslate(0.18, -0.08, -0.07);
  arm1.matrix.translate(0, armH, 0);
  arm1.matrix.rotate(-g_shoulderAngle, 0, 0, 1);
  arm1.matrix.rotate(-30, 0, 0, 1);
  arm1.matrix.translate(0, -armH, 0);
  let arm1CoordinatesMat = new Matrix4(arm1.matrix);
  arm1.matrix.scale(0.10, 0.18, 0.07);
  arm1.render();

  forearm1 = new Cube();
  forearm1.color = [0.18, 0.26, 0.16, 1.0];
  forearm1.matrix = arm1CoordinatesMat;
  forearm1.matrix.translate(0, -0.1, -0.01);
  forearm1.matrix.translate(0, 0.13, 0);
  forearm1.matrix.rotate(g_elbowAngle, 0, 0, 1);
  forearm1.matrix.rotate(45, 0, 0, 1);
  forearm1.matrix.translate(0, -0.13, 0);
  let forearm1CoordinatesMat = new Matrix4(forearm1.matrix);
  forearm1.matrix.scale(0.10, 0.13, 0.07);
  forearm1.render();  

  hand1 = new Cube();
  hand1.color = [0.3,0.15,0.02,1.0];
  hand1.matrix = forearm1CoordinatesMat;
  hand1.matrix.translate(0, -0.02, -0.01);
  hand1.matrix.rotate(g_wristAngle, 0, 0, 1);
  hand1.matrix.rotate(15, 0, 0, 1);
  hand1.matrix.scale(0.15, 0.05, 0.07);
  hand1.render();

  arm2 = new Cube();
  arm2.color = [0.18, 0.26, 0.16, 1.0];
  arm2.matrix.setTranslate(0.18, -0.08, 0.5);
  arm2.matrix.translate(0, armH, 0);
  arm2.matrix.rotate(g_shoulderAngle, 0, 0, 1);
  arm2.matrix.rotate(-30, 0, 0, 1);
  arm2.matrix.translate(0, -armH, 0);
  let arm2CoordinatesMat = new Matrix4(arm2.matrix);
  arm2.matrix.scale(0.10, 0.18, 0.07);
  arm2.render();  

  forearm2 = new Cube();
  forearm2.color = [0.18, 0.26, 0.16, 1.0];
  forearm2.matrix = arm2CoordinatesMat;
  forearm2.matrix.translate(0, -0.1, 0.01);
  forearm2.matrix.translate(0, 0.13, 0);
  forearm2.matrix.rotate(-g_elbowAngle, 0, 0, 1);
  forearm2.matrix.rotate(45, 0, 0, 1);
  forearm2.matrix.translate(0, -0.13, 0);
  let forearm2CoordinatesMat = new Matrix4(forearm2.matrix);
  forearm2.matrix.scale(0.10, 0.13, 0.07);
  forearm2.render();

  hand2 = new Cube();
  hand2.color = [0.3,0.15,0.02,1.0];
  hand2.matrix = forearm2CoordinatesMat;
  hand2.matrix.rotate(-g_wristAngle, 0, 0, 1);
  hand2.matrix.scale(0.15, 0.05, 0.07);
  hand2.render();
}