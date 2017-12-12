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


function main() {
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0, 0, 0, 1.0);

	const program = new ShaderProgram("vertex-shader", "fragment-shader");
	
	camera = new Camera("view", program);
	camera.flushWith(_ => {
		camera.setPos([0, 0, 0]);
		camera.setTarget([0, 0, -1]);
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

}

main();
