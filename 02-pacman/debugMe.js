let gl

let positions = []
let colors = []

function init() {

	// 1. Get canvas and setup WebGL context
	const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.5,0.5,0.5,1.0);

	// 3. Specify geometry
	// let box = [0, 0, 1, 1, 0, 0.5] // x, y, r, g, b, size
	const boxSize = 0.1

	for (let i = -1; i < 1 - boxSize; i += boxSize) {
		for (let j = -1; j < 1 - boxSize; j += boxSize) {
			const box = {
				x: i + boxSize / 2,
				y: j + boxSize / 2,
				r: Math.random(),
				g: Math.random(),
				b: Math.random(),
				size: boxSize,
			}
			if (i == -1 || j == -1 || i.toFixed(2) == 1 - boxSize || j.toFixed(2) == 1 - boxSize) {
				positions.push([
					box.x - (box.size / 2), box.y - (box.size / 2),
					box.x - (box.size / 2), box.y + (box.size / 2),
					box.x + (box.size / 2), box.y + (box.size / 2),
					box.x + (box.size / 2), box.y + (box.size / 2),
					box.x + (box.size / 2), box.y - (box.size / 2),
					box.x - (box.size / 2), box.y - (box.size / 2),
				])
				// const boxColors = []
				for (let i = 0; i < 6; i += 1) {
					colors.push(box.r)
					colors.push(box.g)
					colors.push(box.b)
					colors.push(1)
				}
			}
		}
	}
	positions = positions.reduce((a, b) => a.concat(b))
	// console.log(colors)

	// const positions = [ -1, -1, 
	// 					-1,  1, 
	// 					 1,  1,
	//                      1,  1,
	//                      1, -1,
	//                     -1, -1];

	// const colors = [    1, 0, 0, 1, // red
	// 				    1, 1, 0, 1, // yellow
	// 			        0, 0, 1, 1, // blue
	//                     0, 0, 1, 1, // blue
	// 				    0, 1, 0, 1, // green
	// 				    1, 0, 0, 1] // red

	// const positions = [
	// 	0,0,
	// 	-1,-1,
	// 	-1,1,
	// 	1,1
	// ]


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
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

init();
