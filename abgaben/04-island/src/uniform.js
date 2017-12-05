/**
 * Ein Uniform mit einer 4x4 Matrix als Typ.
 * 
 * @constructor
 * @param {String} name Der Name der Uniform Variable im Shader.
 * @param {Array<Number>} mat Die Matrix, in row-major Ordnung.
 */
function UniformMat4(name, mat) {
    this.name = name;
    this.mat = new Float32Array(transpose(mat));
}

/**
 * Setzt den Uniform für ein Shaderprogramm.
 * 
 * @param {WebGLProgram} program Das Shaderprogramm für das der Uniform gesetzt wird.
 */
UniformMat4.prototype.set = function (program) {
    const uniform = gl.getUniformLocation(program, this.name);
	gl.uniformMatrix4fv(uniform, false, this.mat);
}