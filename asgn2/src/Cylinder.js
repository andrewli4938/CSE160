class Cylinder {
  constructor() {
    this.type = 'cone';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.segments = 20;
    this.matrix = new Matrix4();
  }

  render() {  
    var rgba = this.color;
    var xy = [0, 0];

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    

    
    const d = 10/100;
    let angleStep = 360/this.segments;

    for (var angle = 0; angle < 360; angle = angle + angleStep) {
        let centerPt = [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle+angleStep;
        let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
        let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
        let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
        let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

        drawTriangle3D( [xy[0],0,xy[1],    pt1[0],0,pt1[1],     pt2[0],0,pt2[1]] );
    }
  }
}