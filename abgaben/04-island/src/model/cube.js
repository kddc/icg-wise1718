class Cube {
    constructor() {
        const mesh = [
            // Mantel
            0, 0, 0, 1, 0, 1, 0, 1,
            0, 1, 0, 1, 0, 1, 0, 1,
            1, 0, 0, 1, 0, 1, 0, 1,
            1, 1, 0, 1, 0, 1, 0, 1,
            1, 0, -1, 1, 0, 1, 0, 1,
            1, 1, -1, 1, 0, 1, 0, 1,
            0, 0, -1, 1, 0, 1, 0, 1,
            0, 1, -1, 1, 0, 1, 0, 1,
            0, 0, 0, 1, 0, 1, 0, 1,
            0, 1, 0, 1, 0, 1, 0, 1,

            // oben
            0, 1, 0, 1, 1, 1, 0, 1,
            0, 1, -1, 1, 1, 1, 0, 1,
            1, 1, 0, 1, 1, 1, 0, 1,
            1, 1, -1, 1, 1, 1, 0, 1,

            // unten
            0, 0, 0, 1, 1, 0, 0, 1,
            0, 0, -1, 1, 1, 0, 0, 1,
            1, 0, 0, 1, 1, 0, 0, 1,
            1, 0, -1, 1, 1, 0, 0, 1,
        ];

        this.model = new Model("model");
        this.numVertices = mesh.length / 8;
        this.buffer = new VertexArrayBuffer(mesh, gl.STATIC_DRAW);
        this.buffer.addAttribute(new Attribute("pos", 4, gl.FLOAT, 32, 0));
        this.buffer.addAttribute(new Attribute("color", 4, gl.FLOAT, 32, 16));
    }

    use(program) {
        program.setUniform(this.model);
        program.useBuffer(this.buffer);
    }

    draw() {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
        gl.drawArrays(gl.TRIANGLE_STRIP, 10, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, 14, 4);
    }
}
