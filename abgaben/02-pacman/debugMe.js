let gl

let positions = []
let colors = []

// Deg to Rad
function rad(angle) {
	return (angle * Math.PI / 180);
}

// https://www.mathopenref.com/coordcirclealgorithm.html
function drawPacman(radius = 1, numberOfVertices = 8, angleMouth = 30, angleDirection = 0) {
	const center = [0,0]
	const positions = []
	const colors = []
	// zieht den radius des Mundes von dem Kreis ab und teilt den Rest
	// durch die Anzahl der angegebenen Vertices
	const segment = (360 - angleMouth) / numberOfVertices
	// Mitte des Kreises von dem der Fan aufgespannt wird
	positions.push(0,0)
	// Schleife über die Anzahl der Vertices. Die Größe der einzelnen
	// Segmente wird durch segment bestimmt
	for (let i = 0; i <= numberOfVertices; i += 1) {
		// (angleMouth / 2) als Offset damit der Mund zentriert ist
		const angle = i * segment + (angleMouth / 2) + angleDirection
		const x = center[0] + radius * Math.cos(rad(angle))
		const y = center[1] - radius * Math.sin(rad(angle))
		positions.push(x, y)
  }

  for (let i = 0; i < (positions.length / 2); i++) {
    colors.push(1, 1, 0, 1);
  }

	return {
		positions,
		colors
	}
}

function init() {

	// 1. Get canvas and setup WebGL context
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.5,0.5,0.5,1.0);

	const pacman = drawPacman(0.7, 20, 60, 0)
	positions = pacman.positions
	colors = pacman.colors

	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

    // 5. Create VBO
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    // 6. Fill VBO with positions and colors
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW);

    // 7. Link data in VBO to shader variables
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	const vColor = gl.getAttribLocation(program, "vColor");
	gl.enableVertexAttribArray(vColor);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length * 4);

	// 8. Render
	render();
};

function render()
{
	// console.log(positions.length)
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);
}

init();
