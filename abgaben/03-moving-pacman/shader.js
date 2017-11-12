/**
 * Repräsentiert ein OpenGL Shaderprogramm.
 * 
 * @constructor
 * @param {String} vertexShaderId Die Id des Vertex Shaders im HTML Dokument.
 * @param {String} fragmentShaderId Die Id des Fragment Shaders im HTML Dokument.
 */
function ShaderProgram(vertexShaderId, fragmentShaderId) {
    const vertShaderSrc = document.querySelector('#' + vertexShaderId).text;
    const fragShaderSrc = document.querySelector('#' + fragmentShaderId).text;

    vertexShader = compileShader(gl.VERTEX_SHADER, vertShaderSrc);
    fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragShaderSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Failed to link shader program: " + gl.getProgramInfoLog(program));
    }

    this.program = program;
}

/**
 * Aktiviert das Shaderprogramm.
 */
ShaderProgram.prototype.use = function () {
    gl.useProgram(this.program);
}

/**
 * Aktiviert einen Buffer und alle dazugehörigen Attribute für diese Programm.
 * 
 * @param {*} buffer Der zu aktivierende Buffer.
 */
ShaderProgram.prototype.useBuffer = function (buffer) {
    buffer.bind();

    for (let attrib of buffer.attributes) {
        const pos = gl.getAttribLocation(this.program, attrib.name);

        if (pos === -1) {
            throw new Error(`Variable '${attrib.name}' does not exist in the shader.`);
        }

        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, attrib.length, attrib.type, false, attrib.stride, attrib.offset);
    }
}

/**
 * Setzt ein Uniform für diese Programm.
 * 
 * @param {*} uniform Der Uniform, der aktiviert wird.
 */
ShaderProgram.prototype.setUniform = function (uniform) {
    uniform.set(this.program);
}

/**
 * Kompiliert einen OpenGL Shader.
 * 
 * @param {*} shaderType Die Art des Shaders.
 * @param {String} shaderSource Der Sourcecode des Shaders.
 * @returns {WebGLShader} Der kompilierte Shader.
 */
function compileShader(shaderType, shaderSource) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!ok) {
        throw new Error("Failed to compile shader:" + gl.getShaderInfoLog(shader));
    }
    else {
        return shader;
    }
}
