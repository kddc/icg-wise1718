// Environment variables
let gl, canvas;

// Scene variables
let objects = [];

// Shader variables
let program;

let pointLoc, colorLoc, normalLoc, texCoordLoc;

// TODO: Deklariere unsere benötigten Attribute- und Uniform-Variablenlocations als globale Variablen
let normalMatrixLoc;
let kaLoc, ksLoc, kdLoc;
let lightPositionLoc, lightPosition, IaLoc, IdLoc, IsLoc;

let withLightningLoc, withTextureLoc, withBumpmapLoc;

let modelMatrixLoc;

let viewMatrixLoc, viewMatrix;

let projectionMatrixLoc, projectionMatrix;

let eye, target, up;

let sandTexture, sandNormalTexture;
let diffuseMapLoc, normalMapLoc;

let keyPressed = {
	KeyW: false,
	KeyA: false,
	KeyS: false,
	KeyD: false
};

const speed = 0.02;

function degToRad (deg) {
	return deg * Math.PI / 180;
}

function initTextures() {
  sandTexture = gl.createTexture();
  sandImage = new Image();
  sandImage.onload = function () { handleTextureLoaded(sandImage, sandTexture); }
  sandImage.src = "./assets/sand_diffuse.jpg";

  // TODO: Erstelle analog zu diffuser Textur eine Normal Map für den Sand.
  sandNormalTexture = gl.createTexture();
  sandNormalImage = new Image();
  sandNormalImage.onload = function () { handleTextureLoaded(sandNormalImage, sandNormalTexture); }
  sandNormalImage.src = "./assets/sand_normal.jpg";
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
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
	gl.clearColor(0.5, 0.8, 0.95, 0.9);
	gl.enable(gl.DEPTH_TEST);

  // 3. Specify vertices
  const red = [1, 0, 0, 1]
  const green = [0, 1, 0, 1]
  const blue = [0, 0, 1, 1]
  const yellow = [1, 1, 0, 1]
  const brown = [0.45, 0.33, 0, 1]

	// let cube1 = new Cube({x: -2, y: -0.5, z: -2}, {x: 2, y: 0, z: 2});
	// objects.push(cube1);
  //
	// let cube2 = new Cube();
	// cube2.SetModelMatrix({x: -0.5, y: 0, z: -1}, {x: 180, y: 45, z: 90});
	// objects.push(cube2);
  //
	// let cube3 = new Cube();
	// cube3.SetModelMatrix({x: 0.5, y: 1, z: 0}, {x: 0, y: 0, z: 45});
	// objects.push(cube3);

  const water = new Cube(
    from = { x: -50.0, y: 0.0, z: -50.0 },
    to = { x: 50.0, y: -1.0, z: 50.0 },
    sideColors = { front: blue,  right: blue,  back: blue, left: blue,  bottom: blue,  top: blue },
    withLightning = true
  )
  objects.push(water);

  const island = new Cube(
    from = {x: -7.5, y: -0.10, z: -7.5},
    to = {x: 7.5, y: 0.01, z: 7.5},
    sideColors = { front: yellow,  right: yellow,  back: yellow, left: yellow,  bottom: yellow,  top: yellow },
    withLightning = true,
    withTexture = true,
    withBumpmap = true
  )
  console.log(island)
  objects.push(island);

  // Stamm
  for (i = 0; i <= 3.5; i += 0.5) {
    const trunk = new Trunk(
      bottom = { from: { x: -0.2, z: -0.2 }, to: { x: 0.2, z: 0.2} },
      top = { from: { x: -0.3, z: -0.3 }, to: { x: 0.3, z: 0.3 } },
      sideColors = { front: brown, right: brown, back: brown, left: brown, bottom: brown, top: brown },
      height = 0.5,
      withLightning = true
    )
    trunk.setModelMatrix({ x: 0, y: i, z: 0}, { x: 0, y: 0, z: 0 })
    objects.push(trunk)
  }
  // Blätter
  for (i = 0 ; i <= 360 ; i+= 45) {
    objects.push(new Leaf(
      i, from = {x: 0.0 , y: 4.2, z: 0.5 }, to = {x: 1.0, y: 4.7, z: -0.5},
      sideColors = {front: green, right: green, back: green, left: green, bottom: green, top: green },
      withLightning = true
    ));
  }

  let sunSphere = new Cube(
    { x: -0.2, y: -0.2, z: -0.2 },
    { x: 0.2, y: 0.2, z: 0.2 },
    { front: yellow, right: yellow, back: yellow, left: yellow, bottom: yellow, top: yellow }
  );
	sunSphere.setModelMatrix({x: 5.0, y: 5.0, z: 5.0}, {x: 0, y:0, z: 0});
	objects.push(sunSphere);

	// 4. Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// 7 Save attribute location to address them
	pointLoc = gl.getAttribLocation(program, "vPosition");
	colorLoc = gl.getAttribLocation(program, "vColor");
  normalLoc = gl.getAttribLocation(program, "vNormal");
  texCoordLoc = gl.getAttribLocation(program, "vTexCoord");
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");

    // Set view matrix
	eye = vec3.fromValues(5.0, 3.0, 10.0);
	target = vec3.fromValues(0.0, 1.0, 0.0);
	up = vec3.fromValues(0.0, 1.0, 0.0);

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);

    // Set projection matrix
	projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);

	// 7 Save uniform location and save the projection matrix into it
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

  // ###########################################################################

  // TODO: Hier die Speicherlocations der Normalenmatrix, der Materialkoeffizienten und der Lichtintensitäten in die globalen Variablen speichern
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
  lightPositionLoc = gl.getUniformLocation(program, "lightPosition");

  // TODO: Setze hier die Lichteigenschaften I als Uniform-Variablen
  kaLoc = gl.getUniformLocation(program, "ka");
	kdLoc = gl.getUniformLocation(program, "kd");
	ksLoc = gl.getUniformLocation(program, "ks");
  IaLoc = gl.getUniformLocation(program, "Ia");
  IdLoc = gl.getUniformLocation(program, "Id");
  IsLoc = gl.getUniformLocation(program, "Is");

  withLightningLoc = gl.getUniformLocation(program, "lightning");
  withTextureLoc = gl.getUniformLocation(program, "texture");
  withBumpmapLoc = gl.getUniformLocation(program, "bumpmap");

  diffuseMapLoc = gl.getUniformLocation(program, "diffuseMap");
	normalMapLoc = gl.getUniformLocation(program, "normalMap");

  gl.uniform4f(lightPositionLoc, 5.0, 5.0, 5.0, 0.0);
  gl.uniform3fv(IaLoc, [0.7, 0.7, 0.7]);
  gl.uniform3fv(IdLoc, [0.5, 0.5, 0.5]);
  gl.uniform3fv(IsLoc, [0.7, 0.7, 0.7]);

  // ###########################################################################

  // Initialize textures
	initTextures();

  // 8 Register Events
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);
  document.addEventListener("mousemove", changeView);
  canvas.onmousedown = function() {
    canvas.requestPointerLock();
  }

  // 9 Render
  gameLoop();
};

function render()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Connect diffuse map to the shader
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, sandTexture);
	gl.uniform1i(diffuseMapLoc, 0);

	// TODO: Verknüpfe Normal Map analog zu diffuser Map mit Shader.
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, sandNormalTexture);
  gl.uniform1i(normalMapLoc, 0);

  // Call every render function
  objects.forEach(function(object) {
    object.render();
  });
}

function update() {
  let look = [
    (target[0] - eye[0]) * speed,
    (target[1] - eye[1]) * speed,
    (target[2] - eye[2]) * speed
  ];

  /** Using gl-matrix:
    let look = vec3.create();
    vec3.sub(look, target, eye);
    vec3.scale(look, look, speed);
  */

  if(keyPressed.KeyW) {
    eye[0] += look[0];
    eye[2] += look[2];
    target[0] += look[0];
    target[2] += look[2];
  }
  if(keyPressed.KeyS) {
    eye[0] -= look[0];
    eye[2] -= look[2];
    target[0] -= look[0];
    target[2] -= look[2];
  }
  if(keyPressed.KeyA) {
    eye[0] += look[2];
    eye[2] -= look[0];
    target[0] += look[2];
    target[2] -= look[0];
  }
  if(keyPressed.KeyD) {
    eye[0] -= look[2];
    eye[2] += look[0];
    target[0] -= look[2];
    target[2] += look[0];
  }
  mat4.lookAt(viewMatrix, eye, target, up);
  gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function keydown(e) {
  keyPressed[e.code] = true;
}

function keyup(e) {
  keyPressed[e.code] = false;
}

function changeView(e) {
  vec3.rotateY(target, target, eye, -e.movementX * speed);
  mat4.lookAt(viewMatrix, eye, target, up);
}

init ();
