class Camera {
    constructor(uniformName, programs) {
        this.uniformName = uniformName;
        this.programs = programs;
        this.view = [];
        this.pos = [0, 0, 0];
        this.target = [0, 0, -1];
        this.up = [1, 0, 0];

    }

    setPos(pos) {
        this.pos = pos;
    }

    setTarget(tgt) {
        this.target = tgt;
    }

    setUp(up) {
        this.up = up;
    }

    flush() {
        mat4.lookAt(this.view, this.pos, this.target, this.up);

        for (let program of this.programs) {
            program.setUniform(new UniformMat4(this.uniformName, this.view));
        }
    }
}
