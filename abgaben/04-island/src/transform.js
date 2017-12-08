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

class Perspective {
    constructor(uniformName, programs) {
        this.uniformName = uniformName;
        this.programs = programs;
        this.perspective = [];
        this.verticalFov = 90;
        this.ratio = 1;
        this.near = 1;
        this.far = 10;
    }

    setVerticalFov(fov) {
        this.verticalFov = fov;
    }

    setRatio(ratio) {
        this.ratio = ratio;
    }

    setRatioFromDimension(width, height) {
        this.setRatio(width / height);
    }

    setNear(near) {
        this.near = near;
    }

    setFar(far) {
        this.far = far;
    }

    flush() {
        mat4.perspective(this.perspective, this.verticalFov, this.ratio, this.near, this.far);

        for (let program of this.programs) {
            program.setUniform(new UniformMat4(this.uniformName, this.perspective));
        }
    }
}
