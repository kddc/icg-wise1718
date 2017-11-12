function UniformMat4f(name, mat) {
    this.name = name;

    const transposed = [];
    
    for (let offset = 0; offset < 4; offset++) {
        for (let stride = 0; stride <= 12; stride += 4) {
            transposed.push(mat[stride + offset]);
        }
    }

    this.mat = new Float32Array(transposed);
}

UniformMat4f.prototype.set = function (program) {
    const uniform = gl.getUniformLocation(program, this.name);
	gl.uniformMatrix4fv(uniform, false, this.mat);
}