const flatten = (arr) => {
  let r = [];
  for (var i = 0; i < arr.length; ++i) {
    for (var j = 0; j < arr[i].length; ++j)
      r.push(arr[i][j]);
  }
  return r
}

class Model {
  constructor (
    from = {x: -0.5, y: -0.5, z: -0.5},
    to = {x: 0.5, y: 0.5, z: 0.5},
    sideColors = {
      front: [0, 0, 1, 1],
      right: [0, 1, 0, 1],
      back: [1, 0, 0, 1],
      left: [1, 1, 0, 1],
      bottom: [1, 0, 1, 1],
      top: [0, 1, 1, 1]
    },
    withLightning = false,
    withTexture = false,
    withBumpmap = false
  ) {
    this.from = from;
    this.to = to;

    this.sideColors = sideColors;
    this.mesh = [];
    this.colors = [];
    // TODO: Initialisiere das this.normals Array, in das du später die Normalen speicherst
    this.normals = [];
    this.textureCoordinates = [];

    this.orientation = {x: 0, y: 0, z: 0};
    this.position = {x: 0, y: 0, z: 0};
    this.verticesVBO = gl.createBuffer();

    this.withLightning = withLightning;
    this.withTexture = withTexture;
    this.withBumpmap = withBumpmap;

    this.modelMatrix;
		// TODO: Initialisiere die Normalenmatrix als Objektvariable this.normalMatrix
		//       Initialisiere außerdem die Materialkoeffizienten ka, kd, ks als weitere Variablen und gebe ihnen einen Farbwert.
    this.normalMatrix;
		this.ka = vec3.fromValues(0.75, 0.75, 0.75);
		this.kd = vec3.fromValues(0.5, 0.5, 0.5);
		this.ks = vec3.fromValues(0.9, 0.9, 0.9);
  }

  getNormals () {
    const vertices = []
    const normals = []

    for (let i = 0; i < this.mesh.length; i += 3) {
      vertices.push(vec3.fromValues(this.mesh[i], this.mesh[i + 1], this.mesh[i + 2]));
    }

    for (let i = 0; i < vertices.length; i += 3) {
      const u = vec3.sub(vec3.create(), vertices[i + 1], vertices[i]);
      const v = vec3.sub(vec3.create(), vertices[i + 2], vertices[i]);
      const normal = vec3.cross(vec3.create(), u, v);
      const normalized = vec3.normalize(normal, normal);
      normals.push(normalized, normalized, normalized);
    }
    return flatten(normals)
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
    if (this.textureCoordinates.length) {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.concat(this.normals).concat(this.colors).concat(this.textureCoordinates)), gl.STATIC_DRAW);
    } else {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.concat(this.normals).concat(this.colors)), gl.STATIC_DRAW);
    }
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

    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, (this.mesh.length + this.normals.length) * 4);
    gl.enableVertexAttribArray(colorLoc);

    if (this.textureCoordinates.length) {
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, (this.mesh.length + this.normals.length + this.colors.length) * 4);
      gl.enableVertexAttribArray(texCoordLoc);
    }

    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, this.mesh.length/3);
  }
}
