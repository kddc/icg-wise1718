class Trunk {
  constructor (
    bottom = { from: { x: -0.5, z: -0.5 }, to: { x: 0.5, z: 0.5} },
    top = { from: { x: -1, z: -1 }, to: { x: 1, z: 1 } },
    height = 1,
    elements = 5,
    sideColors = {
      front: [0, 0, 1, 1],
      right: [0, 1, 0, 1],
      back: [1, 0, 0, 1],
      left: [1, 1, 0, 1],
      bottom: [1, 0, 1, 1],
      top: [0, 1, 1, 1]
    },
  ) {
    this.from = from;
    this.to = to;

    this.bottom = bottom;
    this.top = top;
    this.height = height;
    this.elements = elements;

    this.sideColors = sideColors;
    this.mesh = [];
    this.colors = [];
    this.orientation = {x: 0, y: 0, z: 0};
    this.position = {x: 0, y: 0, z: 0};
    this.verticesVBO = gl.createBuffer();
    this.modelMatrix = this.SetModelMatrix(this.position, this.orientation);

    this.MakeModel();
    this.InitBuffer();
	}

  /**
  * Makes the model, namely the mesh and the colors arrays
  */
  MakeModel () {
    for (let i = 0; i <= this.elements; i++) {
      const yposition = 0 + i * height
      console.log(yposition)
      this.mesh = this.mesh.concat([
        // Front
        this.bottom.from.x, yposition, this.bottom.from.z,
        this.top.from.x, yposition + this.height, this.top.from.z,
        this.top.to.x, yposition + this.height, this.top.from.z,

        this.top.to.x, yposition + this.height, this.top.from.z,
        this.bottom.to.x, yposition, this.bottom.from.z,
        this.bottom.from.x, yposition, this.bottom.from.z,

        // Right
        this.bottom.to.x, yposition, this.bottom.from.z,
        this.bottom.to.x, yposition, this.bottom.to.z,
        this.top.to.x, yposition + this.height, this.top.to.z,

        this.bottom.to.x, yposition, this.bottom.from.z,
        this.top.to.x, yposition + this.height, this.top.to.z,
        this.top.to.x, yposition + this.height, this.top.from.z,

        // Back
        this.bottom.from.x, yposition, this.bottom.to.z,
        this.top.from.x, yposition + this.height, this.top.to.z,
        this.top.to.x, yposition + this.height, this.top.to.z,

        this.top.to.x, yposition + this.height, this.top.to.z,
        this.bottom.to.x, yposition, this.bottom.to.z,
        this.bottom.from.x, yposition, this.bottom.to.z,

        // Left
        this.bottom.from.x, yposition, this.bottom.from.z,
        this.bottom.from.x, yposition, this.bottom.to.z,
        this.top.from.x, yposition + this.height, this.top.to.z,

        this.bottom.from.x, yposition, this.bottom.from.z,
        this.top.from.x, yposition + this.height, this.top.to.z,
        this.top.from.x, yposition + this.height, this.top.from.z,

        // Bottom
        this.bottom.from.x, yposition, this.bottom.to.z,
        this.bottom.from.x, yposition, this.bottom.from.z,
        this.bottom.to.x, yposition, this.bottom.from.z,

        this.bottom.from.x, yposition, this.bottom.to.z,
        this.bottom.to.x, yposition, this.bottom.to.z,
        this.bottom.to.x, yposition, this.bottom.from.z,

        // Top
        this.top.from.x, yposition + this.height, this.top.to.z,
        this.top.from.x, yposition + this.height, this.top.from.z,
        this.top.to.x, yposition + this.height, this.top.from.z,

        this.top.from.x, yposition + this.height, this.top.to.z,
        this.top.to.x, yposition + this.height, this.top.to.z,
        this.top.to.x, yposition + this.height, this.top.from.z,
      ])

      for (let i = 0; Math.floor(i/6) < 6; i++) {
        this.colors = this.colors.concat(Object.values(this.sideColors)[Math.floor(i/6)]);
      }
    }
  }

  /**
  * Sets the model matrix
  * @param {Object} position x,y,z
  * @param {Object} orientation x,y,z - angles in degree
  */
  SetModelMatrix (position, orientation) {

    // Convert the orientation to RAD
    orientation = {x: degToRad(orientation.x), y: degToRad(orientation.y), z: degToRad(orientation.z)};

    // Set the transformation matrix
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      position.x, position.y, position.z, 1
    ];
  }

	/**
  * Sets the buffer data
  */
  InitBuffer () {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.concat(this.colors)), gl.STATIC_DRAW);
  }

  /**
  * Updates the model matrix to the buffer
  */
  UpdateBuffer () {
    // Push the matrix to the buffer
    gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(this.modelMatrix));
  }

  Render () {

    // Bind the program and the vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

    // Set attribute pointers and enable them
    gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, this.mesh.length*4);
    gl.enableVertexAttribArray(pointLoc);
    gl.enableVertexAttribArray(colorLoc);

    // Set uniforms
    this.UpdateBuffer();

    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, this.mesh.length/3);
  }
}
