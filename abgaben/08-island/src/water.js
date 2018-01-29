class Water {
  constructor (
    lod = 16,
    colors = {
      ka: [0.4, 0.4, 1.0],
      kd: [0.4, 0.4, 1.0],
      ks: [0.4, 0.4, 1.0]
    }
  ) {
    this.lod = lod;
    this.size = 20.0;
    this.mesh = [];
    this.normals = [];
    this.textureCoordinates = [];
    this.orientation = {x: 0, y: 0, z: 0};
    this.position = {x: 0, y: 0, z: 0};
    this.verticesVBO = gl.createBuffer();
    this.modelMatrix;
    this.normalMatrix;

    this.ka = vec4.fromValues(colors.ka[0],colors.ka[1],colors.ka[2]);
    this.kd = vec4.fromValues(colors.kd[0],colors.kd[1],colors.kd[2]);
    this.ks = vec4.fromValues(colors.ks[0],colors.ks[1],colors.ks[2]);

    this.withLightning = true;
    this.withTexture = false;
    this.withBumpmap = false;
    this.isWater = true;

    this.makeModel();
    this.setModelMatrix(this.position, this.orientation);
    this.initBuffer();
  }

  /**
	 * Makes the model, namely the mesh and the colors arrays
	 */
  makeModel () {
    const y = -0.3
    const segment = this.size / this.lod;
    for (let i = -this.lod / 2; i < this.lod / 2; i++) {
      for (let j = -this.lod / 2; j < this.lod / 2; j++) {
        this.mesh = this.mesh.concat([
          segment * i, y, segment * j,
          segment * (i + 1), y, segment * j,
          segment * i, y, segment * (j + 1),
          segment * (i + 1), y, segment * j,
          segment * i, y, segment * (j + 1),
          segment * (i + 1), y, segment * (j + 1),
        ]);
      }
    }

    for (let i = 0; i < this.lod * this.lod * 6; i++) {
      this.normals = this.normals.concat([ 0.0, 1.0, 0.0 ]);
    }

    for (let i = 0; i < this.lod * this.lod; i++) {
      this.textureCoordinates = this.normals.concat([
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
      ])
    }
	}

  /**
  * Sets the model matrix
  * @param {Object} position x,y,z
  * @param {Object} orientation x,y,z - angles in degree
  */
  setModelMatrix (position, orientation) {
    // Convert the orientation to RAD
    orientation = {x: degToRad(orientation.x), y: degToRad(orientation.y), z: degToRad(orientation.z)};

    // Set the transformation matrix
    this.modelMatrix = mat4.create();
    mat4.translate(this.modelMatrix, this.modelMatrix, [position.x, position.y, position.z]);
    mat4.rotate(this.modelMatrix, this.modelMatrix, orientation.x, [1, 0, 0]);
    mat4.rotate(this.modelMatrix, this.modelMatrix, orientation.y, [0, 1, 0]);
    mat4.rotate(this.modelMatrix, this.modelMatrix, orientation.z, [0, 0, 1]);

    // TODO: Erstelle hier die Normalenmatrix und speichere sie in die Variable this.normalMatrix
    // Errechne dafür zunächst die modelMatrix im Weltkoordinatensystem, indem du sie mit der viewMatrix multiplizierst. Erzeuge dann die transponierte, inverse Normalenmatrix
    this.normalMatrix = mat4.create();
    mat4.invert(this.normalMatrix, this.modelMatrix * viewMatrix);
    mat4.transpose(this.normalMatrix, this.normalMatrix);
  }
  /**
   * Sets the buffer data
   */
  initBuffer () {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

    // TODO: Übergebe hier sowohl das Mesh, als auch die Normalen an das VBO
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.concat(this.normals).concat(this.textureCoordinates)), gl.STATIC_DRAW);
    gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(this.modelMatrix));
    gl.uniformMatrix4fv(normalMatrixLoc, false, new Float32Array(this.normalMatrix));
  }

  /**
   * Updates the model matrix to the buffer
   */
  updateBuffer () {
    // Push the matrix to the buffer
    gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(this.modelMatrix));

    // TODO: Übergebe hier die Normalenmatrix an den Shader
    gl.uniformMatrix4fv(normalMatrixLoc, false, new Float32Array(this.normalMatrix));
    // TODO: Übergebe hier die Materialkoeffizienten des Objektes an den Shader
    gl.uniform3f(kaLoc, this.ka[0], this.ka[1], this.ka[2]);
    gl.uniform3f(ksLoc, this.ks[0], this.ks[1], this.ks[2]);
    gl.uniform3f(kdLoc, this.kd[0], this.kd[1], this.kd[2]);

    gl.uniform1f(withLightningLoc, this.withLightning);
    gl.uniform1f(withTextureLoc, this.withTexture);
    gl.uniform1f(withBumpmapLoc, this.withBumpmap);
    gl.uniform1f(isWaterLoc, this.isWater);
  }

  render () {
    // Bind the program and the vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

    // Set uniforms
    this.updateBuffer();

    // Set attribute pointers and enable them
    gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pointLoc);

    // TODO: Setze hier den Attribute Pointer für die Normalen
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, this.mesh.length * 4);
    // TODO: Aktiviere das Normalen-Attribut
    gl.enableVertexAttribArray(normalLoc);

    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, (this.mesh.length + this.normals.length) * 4);
    gl.enableVertexAttribArray(texCoordLoc);

    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, this.mesh.length/3);
  }
}
