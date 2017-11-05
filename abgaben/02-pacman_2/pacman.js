let gl;
// Declare arrays with global scope to make them accessible throughout the entire program
let positions = [0, 0]; //initial vertex is the center
let colors = [1.0, 0.8, 0, 1]; //color: orange

function drawPacman(radius, numberOfVertices, angleMouth) {

	// 1. Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	//iterate over numberOfVertices
	for(let i = 0; i <= 360; i += 360/numberOfVertices)
	{
		//degrees shifted so that the pacman looks better (now there is no edge on the very right)
		let degrees = (i + 180/numberOfVertices) % 360;
		//degrees -> radians
		let radians = Math.PI * (degrees / 180);
	
		//new Vertex for the pacman
		let pacmanVertex = {
			x: Math.cos(radians) * radius/10, //new x-coordinate
			y: Math.sin(radians) * radius/10, //new y-coordinate
			//every fragment has the same color (orange)
			r: 1,
			g: 0.8,
			b: 0
		}

		console.log("angleMouth: " + angleMouth);
		console.log("degrees: "+ degrees);
		//concat positions
		if(degrees <= angleMouth/2 || degrees > 360 - angleMouth/2) //check if the current angle is the mouth angle
		{
			positions = positions.concat([0, 0]);//if yes: next vertex is the center
		}
		positions = positions.concat([pacmanVertex.x, pacmanVertex.y]);//update positions
		console.log(positions);

		//concat colors
		colors = colors.concat([pacmanVertex.r, pacmanVertex.g, pacmanVertex.b, 1,
								pacmanVertex.r, pacmanVertex.g, pacmanVertex.b, 1]);
	}

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
	// Compute offset of first color in VBO with NumberOfVertexPositions * NumberOfComponentsPerVertexPosition * NumberOfBytesPerComponent
	// = NumberOfVertices * 2 * 4 Bytes = positions.length * 4 Bytes
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length * 4); 

	// 8. Render
	render();
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Compute number of vertices as positions.length / 2 (since array 'positions' contains x and y value for every vertex)
	gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);
}