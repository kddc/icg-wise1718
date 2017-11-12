/**
 * Der WebGL Kontext für diesen Thread.
 * @type {WebGLRenderingContext}
 */
let gl;
let pacman;

function init() {

	// 1. Get canvas and setup WebGL context
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");

	// 2. Configure viewport
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	const program = new ShaderProgram("vertex-shader", "fragment-shader");
	pacman = new Pacman(0, 0, 0.3, program);

	// den ersten frame zeichnen
	gl.clear(gl.COLOR_BUFFER_BIT);
	pacman.draw();
}

/**
 * Repräsentiert einen Pacman, der gezeichnet werden kann.
 * 
 * @constructor
 * @param {Number} x Die Startposition in x-Richtung.
 * @param {Number} y Die Startposition in y-Richtung.
 * @param {Number} radius Der Radius des Pacman.
 * @param {ShaderProgram} program Das Shaderprogramm, das den Pacman rendert.
 */
function Pacman(x, y, radius, program) {
	this.x = x;
	this.y = y;
	this.orientation = 0.0;
	this.numVertices = 80;
	this.radius = radius;
	this.program = program;

	// vertex buffer füllen
	const vertices = this.vertices(radius, this.numVertices, 60);
	this.vertexBuffer = new VertexArrayBuffer(vertices, gl.STATIC_DRAW);
	this.vertexBuffer.addAttribute(new Attribute("vPosition", 4, gl.FLOAT, 32, 0));
	this.vertexBuffer.addAttribute(new Attribute("vColor", 4, gl.FLOAT, 32, 16));

	// programm aktivieren und uniforms auf initialwerte setzen
	this.program.use();
	this.program.useBuffer(this.vertexBuffer);
	this.program.setUniform(new UniformMat4f("trans", translate(x, y, 0)));
	this.program.setUniform(new UniformMat4f("rotate", rotateZAxis(0)));
}

/**
 * Bewegt den Pacman in Blickrichtung.
 * 
 * @param {Number} dist Die Distanz, um die sich der Pacman bewegt, in NDC.
 */
Pacman.prototype.moveForward = function (dist) {
	// x und y für kreis mit r = dist und dem gegebenen winkel
	const x = dist * Math.cos(this.orientation);
	const y = dist * Math.sin(this.orientation);

	this.move(x, y);
}

/**
 * Bewegt den Pacman um den gegebenen Vektor.
 * 
 * @param {*} x Die x-Komponente des Vektors.
 * @param {*} y Die y-Komponente des Vektors.
 */
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

	this.program.setUniform(new UniformMat4f("trans", translate(this.x, this.y, 0)));
}

/**
 * Dreht den Pacman um den gegebenen Winkel.
 * 
 * @param {Number} deg Der Winkel, um den der Pacman gedreht wird, in Grad.
 */
Pacman.prototype.rotate = function (deg) {
	const rad = toRad(deg);

	// verhältnis von 2pi ausrechnen und auf [0, 1) normalisieren,
	// damit orientation nicht unendlich wächst
	const ratio = (this.orientation + rad) / (2 * Math.PI);
	const normalizedRatio = ratio - Math.floor(ratio);
	this.orientation = (2 * Math.PI) * normalizedRatio;

	this.program.setUniform(new UniformMat4f("rotate", rotateZAxis(this.orientation)));
}

/**
 * Zeichnet den Pacman in seinem momentanen Zustand.
 */
Pacman.prototype.draw = function () {
	gl.drawArrays(gl.TRIANGLE_FAN, 0, this.numVertices);
}

/**
 * Erzeugt ein Array von Vertices für den Pacman.
 * 
 * @param {Number} radius Der Radius des Pacman in NDC. 
 * @param {Number} numVertices Die Anzahl an Vertices, mit denen der Pacman dargestellt wird.
 * @param {Number} angleMouth Der Winkel des Munds, in Grad.
 * @returns {Number[]} Das erstellte Vertex-Array.
 */
Pacman.prototype.vertices = function (radius, numVertices, angleMouth) {
	// https://www.mathopenref.com/coordcirclealgorithm.html

	// Mitte des Kreises von dem der Fan aufgespannt wird
	const positions = [0, 0, 0, 1, 1, 1, 0, 1];
	const numOuterVertices = numVertices - 1;

	// zieht den radius des Mundes von dem Kreis ab und teilt den Rest
	// durch die Anzahl der angegebenen Vertices
	const segment = (360 - angleMouth) / numOuterVertices;

	// Schleife über die Anzahl der Vertices. Die Größe der einzelnen
	// Segmente wird durch segment bestimmt
	for (let i = 0; i < numOuterVertices; i++) {
		// (angleMouth / 2) als Offset damit der Mund zentriert ist
		const angle = i * segment + (angleMouth / 2);
		const x = this.x + radius * Math.cos(toRad(angle));
		const y = this.y - radius * Math.sin(toRad(angle));
		positions.push(x, y, 0, 1, 1, 1, 0, 1);
	}

	return positions;
}

/**
 * Konvertiert Winkel in Grad nach Bogenmaß.
 * 
 * @param {Number} angle Der Winkel in Grad.
 * @returns {Number} Der Winkel in Bogenmaß.
 */
function toRad(angle) {
	return (angle * Math.PI / 180);
}

function onKeyDown(e) {
	const keyCode = e.which || e.keyCode;
	const left = 37;
	const up = 38;
	const right = 39;
	const down = 40;

	// den zustand von pacman verändern und neuzeichnen
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
