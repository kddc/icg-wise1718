let gl;
let activeProgram;
let positions;
let colors;
let pacman;

function init() {

	// 1. Get canvas and setup WebGL context
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	const ret = drawPacman(0.3, 80, 60, 0);
	positions = ret.positions;
	colors = ret.colors;
	pacman = ret.pacman;

	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	useProgram(program);

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

	// uniforms setzen
	translate(0, 0);
	rotateZAxis(0);

	// 8. Render
	render();
}

function onKeyDown(e) {
	const keyCode = e.which || e.keyCode;
	const left = 37;
	const up = 38;
	const right = 39;
	const down = 40;

	switch (keyCode) {
		case left:
			pacman.rotate(1);
			break;
		case right:
			pacman.rotate(-1);
			break;
		case up:
			pacman.moveForward(0.1);
			break;
		default:
			break;
	}
}

function Pacman(x, y, radius) {
	this.x = x;
	this.y = y;
	this.orientation = 0.0;
	this.radius = radius;
}

Pacman.prototype.moveForward = function (dist) {
	// x und y für kreis mit r = dist und dem gegebenen winkel
	const x = dist * Math.cos(this.orientation);
	const y = dist * Math.sin(this.orientation);

	this.move(x, y);
}

Pacman.prototype.move = function (x, y) {
	const xMax = 1.0 - this.radius;
	const xMin = -1.0 + this.radius;
	const xNew = this.x + x;

	// wenn x unterhalb von max ist, ist das neue x
	// entweder x oder min, falls x unter min liegt
	if (xNew <= xMax) {
		this.x = (xNew >= xMin) ? (xNew) : (xMin);
	} else {
		this.x = xMax;
	}

	const yMax = 1.0 - this.radius;
	const yMin = -1.0 + this.radius;
	const yNew = this.y + y;

	// analog für y
	if (yNew <= yMax) {
		this.y = (yNew >= xMin) ? (yNew) : (yMin);
	} else {
		this.y = yMax;
	}

	translate(this.x, this.y);
	render();
}

Pacman.prototype.rotate = function (deg) {
	const rad = toRad(deg);

	// verhältnis von 2pi ausrechnen und auf [0, 1) normalisieren,
	// damit orientation nicht unendlich wächst
	const ratio = (this.orientation + rad) / (2 * Math.PI);
	const normalizedRatio = ratio - Math.floor(ratio);
	this.orientation = (2 * Math.PI) * normalizedRatio;

	rotateZAxis(this.orientation);
	render();
}

// https://www.mathopenref.com/coordcirclealgorithm.html
function drawPacman(radius = 1, numberOfVertices = 8, angleMouth = 30, angleDirection = 0) {
	const center = [0, 0];
	const positions = [];
	const colors = [];
	// zieht den radius des Mundes von dem Kreis ab und teilt den Rest
	// durch die Anzahl der angegebenen Vertices
	const segment = (360 - angleMouth) / numberOfVertices;
	// Mitte des Kreises von dem der Fan aufgespannt wird
	positions.push(0, 0);
	// Schleife über die Anzahl der Vertices. Die Größe der einzelnen
	// Segmente wird durch segment bestimmt
	for (let i = 0; i <= numberOfVertices; i += 1) {
		// (angleMouth / 2) als Offset damit der Mund zentriert ist
		const angle = i * segment + (angleMouth / 2) + angleDirection;
		const x = center[0] + radius * Math.cos(toRad(angle));
		const y = center[1] - radius * Math.sin(toRad(angle));
		positions.push(x, y);
	}

	for (let i = 0; i < (positions.length / 2); i++) {
		colors.push(1, 1, 0, 1);
	}

	const pacman = new Pacman(0, 0, radius);

	return {
		pacman,
		positions,
		colors
	};
}

function translate(x, y) {
	const mat = new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		x, y, 0, 1
	]);

	setUniformMat4fv(activeProgram, "trans", mat);
}

function rotateZAxis(rad) {
	const mat = new Float32Array([
		Math.cos(rad), Math.sin(rad), 0, 0,
		-Math.sin(rad), Math.cos(rad), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	setUniformMat4fv(activeProgram, "rotate", mat);
}

function setUniformMat4fv(program, uniformName, mat) {
	const uniform = gl.getUniformLocation(program, uniformName);
	gl.uniformMatrix4fv(uniform, false, mat);
}

function useProgram(program) {
	gl.useProgram(program);
	activeProgram = program;
}

// Deg to Rad
function toRad(angle) {
	return (angle * Math.PI / 180);
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);
}

init();
