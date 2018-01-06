class Island {
    constructor() {
        const mesh = __island_mesh;

        this.model = new Model("model");
        this.numVertices = mesh.length / 18;
        this.buffer = new VertexArrayBuffer(mesh, gl.STATIC_DRAW);

        const stride = 18 * 4;
        this.buffer.addAttribute(new Attribute("pos", 4, gl.FLOAT, stride, 0));
        this.buffer.addAttribute(new Attribute("color", 3, gl.FLOAT, stride, 12 * 4));
    }

    use(program) {
        program.setUniform(this.model);
        program.useBuffer(this.buffer);
    }

    draw() {
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
}
