class Island {
    constructor() {
        const mesh = __island_mesh;

        this.model = new Model("model");
        this.numVertices = mesh.length / 18;
        this.buffer = new VertexArrayBuffer(mesh, gl.STATIC_DRAW);

        const stride = 18 * 4;
        this.buffer.addAttribute(new Attribute("pos", 4, gl.FLOAT, stride, 0));
        this.buffer.addAttribute(new Attribute("normal", 3, gl.FLOAT, stride, 4 * 4));
        this.buffer.addAttribute(new Attribute("hardness", 1, gl.FLOAT, stride, 7 * 4));
        this.buffer.addAttribute(new Attribute("alpha", 1, gl.FLOAT, stride, 8 * 4));
        this.buffer.addAttribute(new Attribute("ambient_col", 3, gl.FLOAT, stride, 9 * 4));
        this.buffer.addAttribute(new Attribute("diffuse_col", 3, gl.FLOAT, stride, 12 * 4));
        this.buffer.addAttribute(new Attribute("specular_col", 3, gl.FLOAT, stride, 15 * 4));
    }

    use(program) {
        // viewmodel für normalen vorberechnen, weil die uralte webgl version
        // inverse() nicht unterstützt
        const normal_vm = mat4.multiply([], camera.view, this.model.mat);
        mat4.transpose(normal_vm, normal_vm);
        mat4.invert(normal_vm, normal_vm);
        program.setUniform(new UniformMat4("normal_viewmodel", normal_vm));

        program.setUniform(this.model);
        program.useBuffer(this.buffer);
    }

    draw() {
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
}
