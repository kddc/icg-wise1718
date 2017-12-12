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

/** @type {HTMLCanvasElement} */
let canvas;

let cameraAngle = -Math.PI / 2;


function main() {
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0, 0, 0, 1.0);

	const program = new ShaderProgram("vertex-shader", "fragment-shader");

	camera = new Camera("view", program);
	camera.flushWith(_ => {
		camera.setPos([0, 0, 0]);
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

class Island {
	constructor() {
		const data = [
			-10, -10, -10, 1, 0, 1, 0, 1,
			10, -10, -10, 1, 0, 1, 0, 1,
			0, 10, -10, 1, 0, 1, 0, 1
		];

		this.model = new Model("model");
		this.numVertices = data.length / 8;
		this.buffer = new VertexArrayBuffer(data, gl.STATIC_DRAW);
		this.buffer.addAttribute(new Attribute("pos", 4, gl.FLOAT, 32, 0));
		this.buffer.addAttribute(new Attribute("color", 4, gl.FLOAT, 32, 16));
	}

	use(program) {
		program.setUniform(this.model);
		program.useBuffer(this.buffer);
	}

	draw() {
		gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
	}
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

	const movementDist = 0.5;

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

	// 90 Grad Rotation für eine Bildschirmlänge	
	const radPerScreen = Math.PI / 2;

	window.addEventListener("mousemove", e => {
		// zu drehender Winkel relative zur Distanz die auf dem
		// Bildschirm bewegt wurde
		// negativ = links
		const relMoveX = e.movementX / window.innerWidth;
		cameraAngle += radPerScreen * relMoveX;

		// x und y für kreis mit r = 1 und dem gegebenen winkel
		const x = Math.cos(cameraAngle);
		const z = Math.sin(cameraAngle);

		camera.flushWith(_ => {
			camera.setLook([x, 0, z]);
		});
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
