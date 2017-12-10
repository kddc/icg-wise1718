/**
 * Stellt eine Kamera in einem 3D Raum dar. Die Kamera kontrolliert einen
 * Uniform für die View Matrix.
 * 
 * @description Die gesetzten Werte werden nicht automatisch an den Shader hochgeladen,
 * sondern erst wenn flush() aufgerufen wird.
 */
class Camera {
    /**
     * Erzeugt eine neue Kamera.
     * 
     * @param {String} uniformName Der Name des Uniforms für die View Matrix. 
     * @param {ShaderProgram[]} programs Ein Array von Programmen, für die die Matrix gesetzt werden soll.
     */
    constructor(uniformName, programs) {
        this.uniformName = uniformName;
        this.programs = programs;
        this.view = [];
        this.pos = [0, 0, 0];
        this.target = [0, 0, -1];
        this.up = [1, 0, 0];

    }

    /**
     * Setzt die Position der Kamera.
     * 
     * @param {Number[]} pos Ein Vec3 der die Position beschreibt.
     */
    setPos(pos) {
        this.pos = pos;
    }

    /**
     * Bewegt die Position der Kamera um den gegebenen Wert.
     * 
     * @param {Number[]} vec Ein Vec3, der die Positionsänderung beschreibt.
     */
    move(vec) {
        vec3.add(this.pos, this.pos, vec);
    }

    /**
     * Setzt das Blickziel der Kamera.
     * 
     * @param {Number[]} tgt Ein Vec3 der das Blickziel beschreibt.
     */
    setTarget(tgt) {
        this.target = tgt;
    }

    /**
     * Setzt den Up-Vektor der Kamera.
     * 
     * @param {Number[]} up Ein Vec3 der den Up-Vektor beschreibt.
     */
    setUp(up) {
        this.up = up;
    }

    /**
     * Berechnet eine View Matrix anhand der gesetzten Werte und
     * lädt sie für alle Shader hoch.
     */
    flush() {
        mat4.lookAt(this.view, this.pos, this.target, this.up);

        for (let program of this.programs) {
            program.setUniform(new UniformMat4(this.uniformName, this.view));
        }
    }

    /**
     * Führt fn aus und ruft danach flush() auf. Ermöglicht es effizient mehrere Werte
     * zu setzen, ohne das flushen zu vergessen.
     * 
     * @param {function} fn Eine Funktion die als erstes Argument dieses Object entgegen nimmt. 
     */
    flushWith(fn) {
        fn(this);
        this.flush();
    }
}

/**
 * Stellt eine 3D-Projektion für die Szene dar. Die Perspektive kontrolliert einen Uniform
 * für die Projektionsmatrix.
 * 
 * @description Die gesetzten Werte werden nicht automatisch an den Shader hochgeladen,
 * sondern erst wenn flush() aufgerufen wird.
 */
class Perspective {
    /**
     * Erzeugt eine neue Perspektive.
     * 
     * @param {String} uniformName Der Name des Uniforms für die Perspective Matrix. 
     * @param {ShaderProgram[]} programs Ein Array von Programmen, für die die Matrix gesetzt werden soll.
     */
    constructor(uniformName, programs) {
        this.uniformName = uniformName;
        this.programs = programs;
        this.perspective = [];
        this.verticalFov = 90;
        this.ratio = 1;
        this.near = 1;
        this.far = 10;
    }

    /**
     * Setzt das vertikale FOV. Das horizontale FOV wird in Abhängigkeit zum
     * Seitenverhältnis berechnet (Hor+).
     * 
     * @param {Number} fov Das vertikale FOV in Grad.
     */
    setVerticalFov(fov) {
        this.verticalFov = degToRad(fov);
    }

    /**
     * Setzt das Seitenverhältnis.
     * 
     * @param {Number} ratio Das Seitenverhältnis als height in Relation zu width. 
     */
    setRatio(ratio) {
        this.ratio = ratio;
    }

    /**
     * Setzt das Seitenverhältnis anhand der Dimension des Viewports.
     * 
     * @param {Number} width Die Breite des Viewports.
     * @param {Number} height Die Höhe des Viewports.
     */
    setRatioFromDimension(width, height) {
        this.setRatio(width / height);
    }

    /**
     * Setzt die kleinste Tiefe des Frustrums.
     * 
     * @param {Number} near Die nahste Koordinate bevor geclipt wird. 
     */
    setNear(near) {
        this.near = near;
    }

    /**
     * Setzt die größte Tiefe des Frustrums.
     * 
     * @param {Number} far Die weiteste Koordinate bevor geclipt wird. 
     */
    setFar(far) {
        this.far = far;
    }

    /**
     * Berechnet eine View Matrix anhand der gesetzten Werte und
     * lädt sie für alle Shader hoch.
     */
    flush() {
        mat4.perspective(this.perspective, this.verticalFov, this.ratio, this.near, this.far);

        for (let program of this.programs) {
            program.setUniform(new UniformMat4(this.uniformName, this.perspective));
        }
    }

    /**
     * Führt fn aus und ruft danach flush() auf. Ermöglicht es effizient mehrere Werte
     * zu setzen, ohne das flushen zu vergessen.
     * 
     * @param {function} fn Eine Funktion die als erstes Argument dieses Object entgegen nimmt. 
     */
    flushWith(fn) {
        fn(this);
        this.flush();
    }
}
