// Environment variables
let gl, canvas;

// Scene variables
let objects = [];

// Shader variables
let program;
let pointLoc, colorLoc;
let modelMatrixLoc;
let viewMatrixLoc, viewMatrix;
let projectionMatrixLoc, projectionMatrix;

let eye;
let target;
let up;

function degToRad (deg) {
	return deg * Math.PI / 180;
}

/**
 * Initializes the program, models and shaders
 */
function init() {

	// 1. Get canvas and setup WebGL context
  canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.95,0.95,0.95,1.0);
	gl.enable(gl.DEPTH_TEST);

	// 3. Specify vertices
  const red = [1, 0, 0, 1]
  const green = [0, 1, 0, 1]
  const blue = [0, 0, 1, 1]
  const yellow = [1, 1, 0, 1]
  const brown = [0.45, 0.33, 0, 1]

  const water = new Cube(
    from = { x: -20.0, y: 0.0, z: -20.0 },
    to = { x: 20.0, y: -1.0, z: 20.0 },
    sideColors = { front: blue,  right: blue,  back: blue, left: blue,  bottom: blue,  top: blue }
  )

  const island = new Cube(
    from = {x: -3.0, y: 0.0, z: -3.0},
    to = {x: 3.0, y: 0.05, z: 3.0},
    sideColors = { front: yellow,  right: yellow,  back: yellow, left: yellow,  bottom: yellow,  top: yellow }
  )

  const trunk = new Trunk(
    bottom = { from: { x: -0.1, z: -0.1 }, to: { x: 0.1, z: 0.1} },
    top = { from: { x: -0.2, z: -0.2 }, to: { x: 0.2, z: 0.2 } },
    height = 0.3,
    elements = 5,
    sideColors = { front: brown,  right: brown,  back: brown, left: brown,  bottom: brown,  top: brown }
  )

  const leaf = new Cube(
    from = {x: -0.25, y: 1.9, z: -0.25},
    to = {x: 0.25, y: 1.8, z: 0.25},
    sideColors = { front: green,  right: green,  back: green, left: green,  bottom: green,  top: green }
  )
  const leaves = new Leaves(
    from = {x: -1.0, y: 1.95, z: -1.0},
    to = {x: 1.0, y: 1.5, z: 1.0},
    sideColors = { front: green,  right: green,  back: green, left: green,  bottom: green,  top: green }
  )

  objects.push(water)
  objects.push(island)
  objects.push(trunk)
  objects.push(leaf)
  objects.push(leaves)

  // 4. Init shader program via additional function and bind it
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // 7 Save attribute location to address them
  pointLoc = gl.getAttribLocation(program, "vPosition");
  colorLoc = gl.getAttribLocation(program, "vColor");
  modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");

  // Set view matrix
  eye = vec3.fromValues(0.0, 2.0, 9.0);
	target = vec3.fromValues(0, 0, 0);
	up = vec3.fromValues(0.0, 1.0, 0.0);

  viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, eye, target, up);

  // 7 Save uniform location and save the view matrix into it
  viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
  gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    // Set projection matrix
  projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);

  // 7 Save uniform location and save the projection matrix into it
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

  // register Events
  registerEvents();

  // 8. Render
  render();
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Call every render function
    objects.forEach(function(object) {
		object.Render();
	});

	requestAnimationFrame(render);
}

function registerEvents() {
  let direction
  document.addEventListener("keydown", (e) => {
    switch(e.key) {
      case 'w':
        direction = vec3.fromValues(0,0,-1);
        break;
      case 's':
        direction = vec3.rotateY(direction, vec3.fromValues(0,0,-1), vec3.fromValues(0.0,0.0,0.0), degToRad(180));
        break;
      case 'a':
        direction = vec3.rotateY(direction, vec3.fromValues(0,0,-1), vec3.fromValues(0.0,0.0,0.0), degToRad(90));
        break;
      case 'd':
        direction = vec3.rotateY(direction, vec3.fromValues(0,0,-1), vec3.fromValues(0.0,0.0,0.0), degToRad(270));
        break;
      default:
        direction = vec3.fromValues(0,0,0)
    }
    mat4.lookAt(viewMatrix, vec3.add(eye, eye , direction), vec3.add(target, target , direction), up);
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
  });
}

init ();
