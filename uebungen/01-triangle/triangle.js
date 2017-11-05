let gl;

function init() {

	// 1. Get canvas and setup WebGL context
  const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(canvas.width / 4, canvas.width / 4, canvas.width / 2, canvas.height / 2);
	gl.clearColor(0,0,0,0.25);

	// 3. Specify geometry

  const positions = new Float32Array([
                      -1, -1,
                      -1, 1,
                      1, 1,
                      1,-1,
                      -1,-1,
                      1,1,
                    ]);
  const vertices = new Float32Array([
                      -1, -1,
                      -1, 1,
                      1, 1,
                      1,-1,
                      0, 0, 1, 1,
                      0, 0, 1, 1,
                      0, 0, 1, 1,
                      1, 0, 0, 1,
                    ]);

  const vertices2 = new Float32Array([
                      -1, -1,
                      0, 0, 1, 1,
                      -1, 1,
                      0, 0, 1, 1,
                      1, 1,
                      0, 0, 1, 1,
                      1,-1,
                      1, 0, 0, 1,
                    ]);

	const colors = new Float32Array([
                  0, 0, 1, 1,
                  0, 0, 1, 1,
                  0, 0, 1, 1,
                  1, 0, 0, 1,
                  1, 0, 0, 1,
                  1, 0, 0, 1,
                 ]);

	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

    // 5.1 Create VBO for positions and activate it
	const posVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);

    // 6.1 Fill VBO with positions
	gl.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);
  // gl.bufferData(gl.ARRAY_BUFFER, positions2, gl.STATIC_DRAW);

    // 7.1 Link data in VBO to shader variables
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);

  //   // 5.2 Create VBO for colors and activate it
	// const colorVBO = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
  //
  //   // 6.2 Fill VBO with colors
	// gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // 7.2 Link data in VBO to shader variables
	const vColor = gl.getAttribLocation(program, "vColor");
	gl.enableVertexAttribArray(vColor);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 24, 8);

	// 8. Render
	render();
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.LINE_LOOP, 0, 4);
}

init();
