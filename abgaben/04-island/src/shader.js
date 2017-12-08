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
    use() {
        gl.useProgram(this.program);
    }

    /**
     * Setzt ein Uniform für diese Programm.
     * 
     * @param {*} uniform Der Uniform, der aktiviert wird.
     */
    setUniform(uniform) {
        uniform.set(this.program);
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
