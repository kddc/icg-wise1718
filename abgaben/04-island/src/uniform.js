/**
 * Ein Uniform mit einer 4x4 Matrix als Typ.
 */
class UniformMat4 {
    /**
     * Erzeugt eine neue UniformMat4.
     * 
     * @constructor
     * @param {String} name Der Name der Uniform Variable im Shader.
     * @param {Array<Number>} mat Die Matrix, in row-major Ordnung.
     */
    constructor(name, mat) {
        this.name = name;
        mat4.transpose(this.mat, mat);
        this.mat = new Float32Array(this.mat);
    }

    /**
     * Setzt den Uniform für ein Shaderprogramm.
     * 
     * @param {WebGLProgram} program Das Shaderprogramm für das der Uniform gesetzt wird.
     */
    set(program) {
        const uniform = gl.getUniformLocation(program, this.name);
        gl.uniformMatrix4fv(uniform, false, this.mat);
    }
}