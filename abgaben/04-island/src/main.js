/**
 * Der WebGL Kontext für diesen Thread.
 * @type {WebGLRenderingContext}
 */
let gl;

/**
 * Der RenderLoop, der alle Elemente beinhaltet, die gezeichnet werden.
 * @type {RenderLoop}
 */
let renderLoop;


function main() {
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	const program = new ShaderProgram("vertex-shader", "fragment-shader");

	renderLoop = new RenderLoop();
	renderLoop.start();
}

function registerEvents() {

}

main();
registerEvents();
