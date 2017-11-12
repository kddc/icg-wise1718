function ShaderProgram(vertexShaderId, fragmentShaderId) {
    const vertShaderSrc = document.querySelector('#' + vertexShaderId).text;
    const fragShaderSrc = document.querySelector('#' + fragmentShaderId).text;

    vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
    fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Failed to link shader program: " + gl.getProgramInfoLog(program));
    }

    this.program = program;
}

ShaderProgram.prototype.use = function () {
    gl.useProgram(this.program);
}

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

ShaderProgram.prototype.setUniform = function (uniform) {
    uniform.set(this.program);
}

function compileShader(gl, shaderType, shaderSource) {
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
