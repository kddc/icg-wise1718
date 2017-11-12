let gl;
let pacman;

function init() {

	// 1. Get canvas and setup WebGL context
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	const program = new ShaderProgram("vertex-shader", "fragment-shader");
	pacman = new Pacman(0, 0, 0.3, 80, program);

	gl.clear(gl.COLOR_BUFFER_BIT);
	pacman.draw();
}

function Pacman(x, y, radius, numVertices, program) {
	this.x = x;
	this.y = y;
	this.orientation = 0.0;
	this.radius = radius;
	this.numVertices = numVertices;
	this.program = program;

	const vertices = this.vertices(radius, this.numVertices, 60, 0);
	this.vertexBuffer = new VertexArrayBuffer(vertices, gl.STATIC_DRAW);
	this.vertexBuffer.addAttribute(new Attribute("vPosition", 4, gl.FLOAT, 0, 0));
	this.vertexBuffer.addAttribute(new Attribute("vColor", 4, gl.FLOAT, 0, numVertices * 16));

	this.program.use();
	this.program.useBuffer(this.vertexBuffer);
	this.program.setUniform(new UniformMat4f("trans", translateMat4(x, y)));
	this.program.setUniform(new UniformMat4f("rotate", rotateZAxisMat4(0)));
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

	this.program.setUniform(new UniformMat4f("trans", translateMat4(this.x, this.y)));
}

Pacman.prototype.rotate = function (deg) {
	const rad = toRad(deg);

	// verhältnis von 2pi ausrechnen und auf [0, 1) normalisieren,
	// damit orientation nicht unendlich wächst
	const ratio = (this.orientation + rad) / (2 * Math.PI);
	const normalizedRatio = ratio - Math.floor(ratio);
	this.orientation = (2 * Math.PI) * normalizedRatio;

	this.program.setUniform(new UniformMat4f("rotate", rotateZAxisMat4(this.orientation)));
}

Pacman.prototype.draw = function () {
	gl.drawArrays(gl.TRIANGLE_FAN, 0, this.numVertices);
}

Pacman.prototype.vertices = function (radius, numVertices, angleMouth, angleDirection) {
	// https://www.mathopenref.com/coordcirclealgorithm.html
	const positions = [];
	const colors = [];
	// zieht den radius des Mundes von dem Kreis ab und teilt den Rest
	// durch die Anzahl der angegebenen Vertices
	const segment = (360 - angleMouth) / (numVertices - 1);
	// Mitte des Kreises von dem der Fan aufgespannt wird
	positions.push(0, 0, 0, 1);
	// Schleife über die Anzahl der Vertices. Die Größe der einzelnen
	// Segmente wird durch segment bestimmt
	for (let i = 0; i < (numVertices - 1); i++) {
		// (angleMouth / 2) als Offset damit der Mund zentriert ist
		const angle = i * segment + (angleMouth / 2) + angleDirection;
		const x = this.x + radius * Math.cos(toRad(angle));
		const y = this.y - radius * Math.sin(toRad(angle));
		positions.push(x, y, 0, 1);
	}

	for (let i = 0; i < numVertices; i++) {
		colors.push(1, 1, 0, 1);
	}

	return positions.concat(colors);
}

function toRad(angle) {
	return (angle * Math.PI / 180);
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
			gl.clear(gl.COLOR_BUFFER_BIT);
			pacman.draw();
			break;
		case right:
			pacman.rotate(-1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			pacman.draw();
			break;
		case up:
			pacman.moveForward(0.1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			pacman.draw();
			break;
		default:
			break;
	}
}

init();
