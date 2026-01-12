// DrawTriangle.js (c) 2012 matsuda
function main() {  
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');  
    if (!canvas) { 
        console.log('Failed to retrieve the <canvas> element');
        return false; 
    } 

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
    ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

    // create vector
    const v1 = new Vector3([2.25, 2.25, 0]);
    drawVector(ctx, v1, "red");
}

function drawVector(ctx, v, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    
    ctx.moveTo(200, 200);  // start at the origin
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
    ctx.stroke();
}

function handleDrawEvent() {
    let canvas = document.getElementById('example');  
    let ctx = canvas.getContext('2d');

    // read values from input
    let v1x = document.getElementById("v1x").value;
    let v1y = document.getElementById("v1y").value;
    let v1 = new Vector3([v1x, v1y, 0]);

    let v2x = document.getElementById("v2x").value;
    let v2y = document.getElementById("v2y").value;
    let v2 = new Vector3([v2x, v2y, 0]);

    // clear canvas
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillRect(0, 0, 400, 400);

    // call drawVector 
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");

    // console.log("Draw Button clicked!")
}

function handleDrawOperationEvent() {
    let canvas = document.getElementById('example');  
    let ctx = canvas.getContext('2d');

    // read values from input
    let v1x = document.getElementById("v1x").value;
    let v1y = document.getElementById("v1y").value;
    let v1 = new Vector3([v1x, v1y, 0]);

    let v2x = document.getElementById("v2x").value;
    let v2y = document.getElementById("v2y").value;
    let v2 = new Vector3([v2x, v2y, 0]);

    // clear canvas and render vectors
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillRect(0, 0, 400, 400);
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");

    let operation = document.getElementById("pet-select").value;
    let scalar = document.getElementById("scalar-input").value;

    console.log("Operation: ", operation)

    // handle which function to call and render result
    switch (operation) {
        case "add":
            console.log("Adding")
            drawVector(ctx, v1.add(v2), "green");
            break;
        case "subtract":
            console.log("Subtracting")
            drawVector(ctx, v1.sub(v2), "green");
            break;
        case "divide":
            console.log("Dividing")
            drawVector(ctx, v1.div(scalar), "green");
            drawVector(ctx, v2.div(scalar), "green");
            break;
        case "multiply":
            console.log("Multiplying")
            drawVector(ctx, v1.mul(scalar), "green");
            drawVector(ctx, v2.mul(scalar), "green");
            break;
        case "magnitude":
            console.log("Magnitude v1:", v1.magnitude());
            console.log("Magnitude v2:", v2.magnitude());
            break;
        case "normalize":
            drawVector(ctx, v1.normalize(), "green");
            drawVector(ctx, v2.normalize(), "green");
            break;
        case "angle-between":
            let angle = angleBetween(v1, v2);
            console.log("Angle:", angle * 180 / Math.PI)
            break;
        case "area":
            let area = areaTriangle(v1, v2);
            console.log("Area of the triangle:", area);
            break;
    }
}

function angleBetween(v1, v2) {
    return Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
}

function areaTriangle(v1, v2) {
    let v3 = Vector3.cross(v1, v2);
    return v3.magnitude() / 2;
}