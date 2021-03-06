/**
 * Repräsentiert ein OpenGL Shaderprogramm.
 */
class ShaderProgram {
    /**
     * Erstellt ein neues Shaderprogramm.
     * 
     * @constructor
     * @param {String} vertexShaderId Die Id des Vertex Shaders im HTML Dokument.
     * @param {String} fragmentShaderId Die Id des Fragment Shaders im HTML Dokument.
     */
    constructor(vertexShaderId, fragmentShaderId) {
        const vertShaderSrc = document.querySelector('#' + vertexShaderId).text;
        const fragShaderSrc = document.querySelector('#' + fragmentShaderId).text;

        const vertexShader = compileShader(gl.VERTEX_SHADER, vertShaderSrc);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragShaderSrc);

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
    use() {
        gl.useProgram(this.program);
    }

    /**
     * Setzt ein Uniform für diese Programm.
     * 
     * @param {object} uniform Der Uniform, der aktiviert wird.
     * @param {function} uniform.set Setzt den Uniform für das als Argument übergebene
     * WebGLProgram.
     */
    setUniform(uniform) {
        this.use();
        uniform.set(this.program);
    }

    /**
     * Aktiviert einen Buffer und alle dazugehörigen Attribute für diese Programm.
     * 
     * @param {object} buffer Der zu aktivierende Buffer.
     * @param {function} buffer.use Aktiviert den Buffer.
     * @param {Attribute[]} buffer.attributes Die zu dem Buffer gehörenden Attribute.
     */
    useBuffer(buffer){
        buffer.use();

        for (let attrib of buffer.attributes) {
            const pos = gl.getAttribLocation(this.program, attrib.name);

            if (pos === -1) {
                throw new Error(`Variable '${attrib.name}' does not exist in the shader.`);
            }

            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, attrib.length, attrib.type, false, attrib.stride, attrib.offset);
        }
    }
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
