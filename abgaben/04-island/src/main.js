/**
 * Der WebGL Kontext für diesen Thread.
 * @type {WebGLRenderingContext}
 */
let gl;

/** @type {RenderLoop} */
let renderLoop;

/** @type {PerspectiveProjection} */
let projection;

/** @type {Camera} */
let camera;

/** @type {UniformMat4} */
let normalViewmodelName;

/** @type {HTMLCanvasElement} */
let canvas;


function main() {
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0, 0, 0, 1.0);

	const program = new ShaderProgram("vertex-shader", "fragment-shader");

	camera = new Camera("view", program);
	camera.flushWith(_ => {
		camera.setPos([0, 1, 5]);
		camera.setLook([0, 0, -1]);
		camera.setUp([0, 1, 0]);
	});

	projection = new PerspectiveProjection("projection", program);
	projection.flushWith(_ => {
		projection.setFar(100);
		projection.setNear(0.1);
		projection.setVerticalFov(90);
	});

	renderLoop = new RenderLoop(program, canvas);
	renderLoop.setProjectionMatrix(projection);
	renderLoop.addDrawable(new Island());
	renderLoop.start();

	registerEvents();
}

function registerEvents() {
	const KeyCode = {
		A: 65,
		W: 87,
		S: 83,
		D: 68,
		F: 70,
		Esc: 27
	};

	const movementDist = 0.2;

	window.addEventListener("keydown", e => {
		const keycode = e.which || e.keyCode;

		switch (keycode) {
			case KeyCode.A:
				moveLeft(movementDist);
				break;
			case KeyCode.W:
				moveForwards(movementDist);
				break;
			case KeyCode.S:
				moveBackwards(movementDist);
				break;
			case KeyCode.D:
				moveRight(movementDist);
				break;
			case KeyCode.F:
				canvas.requestPointerLock();
				break;
			case KeyCode.Esc:
				document.exitPointerLock();
				break;
			default:
				break;
		}
	});

	// Mausempfindlichkeit	
	const sens = 4;

	window.addEventListener("mousemove", e => {
		// relative bewegung zur Fenstergröße
		const relMoveX = e.movementX / window.outerWidth;
		const relMoveY = e.movementY / window.outerHeight;
		// unabhängige Zahl für Empfindlichkeit generieren, muss für y normalisiert werden,
		// damit beide Werte vergleichbar sind
		const unitsX = relMoveX;
		const unitsY = relMoveY * (window.outerHeight / window.outerWidth);
		// Winkel der Rotation aus gesetzter Empfindlichkeit
		const angleX = unitsX * sens;
		const angleY = -unitsY * sens;

		const xHor = Math.sin(angleX);
		const zHor = Math.cos(angleX);
		const yVert = Math.sin(angleY);
		const zVert = Math.cos(angleY);

		camera.flushWith(_ => {
			camera.moveLook([xHor, 0, zHor]);
			camera.moveLook([0, yVert, zVert]);
		});
	});

	// immer in der gleichen xz-Ebene bleiben
	camera.onPosChanged((pos, lastPos) => {
		return [pos[0], lastPos[1], pos[2]];
	});
}

function moveLeft(amount) {
	camera.flushWith(_ => {
		camera.move([-amount, 0, 0]);
	});
}

function moveForwards(amount) {
	camera.flushWith(_ => {
		camera.move([0, 0, amount]);
	});
}

function moveRight(amount) {
	camera.flushWith(_ => {
		camera.move([amount, 0, 0]);
	});
}

function moveBackwards(amount) {
	camera.flushWith(_ => {
		camera.move([0, 0, -amount]);
	});
}

main();
