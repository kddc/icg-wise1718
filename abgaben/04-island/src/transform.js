/**
 * Stellt eine Kamera in einem 3D Raum dar. Die Kamera kontrolliert einen
 * Uniform für die View Matrix.
 * 
 * @description Die gesetzten Werte werden nicht automatisch an den Shader hochgeladen,
 * sondern erst wenn flush/flushWith aufgerufen wird.
 */
class Camera {
    /**
     * Erzeugt eine neue Kamera.
     * 
     * @param {String} uniformName Der Name des Uniforms für die View Matrix. 
     * @param {ShaderProgram} program Das Programm, für das die Matrix gesetzt werden soll.
     */
    constructor(uniformName, program) {
        this.uniformName = uniformName;
        this.program = program;
        this.view = [];
        this.pos = [0, 0, 0];
        this.lastPos = [0, 0, 0];
        this.look = [0, 0, -1];
        this.up = [1, 0, 0];
    }

    /**
     * Setzt die Position der Kamera. Die Position kann durch das in
     * onPosChanged callback überschrieben werden.
     * 
     * @param {Number[]} pos Ein Vec3 der die Position beschreibt.
     */
    setPos(pos) {
        this.lastPos = this.pos;

        // event handler aufrufen, um ggfs. pos zu ändern
        if (this.posChanged) {
            this.pos = this.posChanged(pos, this.lastPos);
        } else {
            this.pos = pos;
        }
    }

    /**
     * @callback Camera~OnPosChanged Überschreibt den Wert einer Positonsänderung.
     * @param {Number[]} pos Die neue Position die gesetzt werden soll.
     * @param {Number[]} lastPos Die vorherige Position.
     * @returns {Number[]} Die tatsächlich Position, die für die Property gesetzt wird.
     */

    /**
     * Ermöglicht es den Wert bei einer Positionsänderung zu inspizieren und zu überschreiben.
     * 
     * @param {Camera~OnPosChanged} handler Der Handler für das Event.
     */
    onPosChanged(handler) {
        this.posChanged = handler;
    }

    /**
     * Bewegt die Position der Kamera um den gegebenen Vektor relativ zum
     * Kamerakoordinatensystem, das durch den umgedrehten Look-Vektor entlang 
     * der z-Achse aufgespannt wird (Die z-Achse des Systems liegt auf und in der
     * Richtung des Look-Vektors).
     * 
     * @param {Number[]} vec Ein Vec3, der die Positionsänderung beschreibt.
     */
    move(vec) {
        // die Rotation zwischen der z-Achse vom move Vektor und der
        // z-Achse der Kamerakoordinaten berechnen
        const rotation = quat.rotationTo([], [0, 0, -1], this.look);

        // den move Vektor in die Kamerakoordinaten transformieren
        vec3.transformQuat(vec, vec3.multiply(vec, vec, [1, 1, -1]), rotation);

        // die Bewegung ausführen
        this.setPos(vec3.add([], this.pos, vec));
    }

    /**
     * Setzt die Blickrichtung der Kamera.
     * 
     * @param {Number[]} look Ein Vec3 der die Blickrichtung beschreibt.
     */
    setLook(look) {
        // mit normalisiertem look kann move/moveLook besser rechnen
        vec3.normalize(this.look, look);
    }

    /**
     * Bewegt den look-Vektor um relativ zu einem gegebenen Vektor, der in einem
     * Koordinatensystem liegt, dessen z-Achse genau auf dem momentanem look-Vektor in
     * in der gleichen Richtung liegt.
     * 
     * @param {Number[]} vec Ein Vektor in dem gegebenen Koordinatensystem, der die Rotation
     * des look-Vektors beschreibt.
     */
    moveLook(vec) {
        // normalisieren und in rechtshändig konvertieren
        vec3.normalize(vec, vec);
        vec3.multiply(vec, vec, [1, 1, -1]);

        // drehung ausrechnen
        const rotation = quat.rotationTo([], [0, 0, -1], vec);

        // drehung anwenden und bei mehr als 180 Grad die y-Achse invertieren
        // um die Richtung auszugleichen
        const look = vec3.transformQuat([], this.look, rotation);

        if (look[2] >= 0) {
            look[1] = -look[1];
        }

        this.setLook(look);
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
        const target = [];
        vec3.add(target, this.pos, this.look);
        mat4.lookAt(this.view, this.pos, target, this.up);
        this.program.setUniform(new UniformMat4(this.uniformName, this.view));
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
 * sondern erst wenn flush/flushWith aufgerufen wird.
 */
class PerspectiveProjection {
    /**
     * Erzeugt eine neue Perspektive.
     * 
     * @param {String} uniformName Der Name des Uniforms für die Perspective Matrix. 
     * @param {ShaderProgram} program Das Programm, für das die Matrix gesetzt werden soll.
     */
    constructor(uniformName, program) {
        this.uniformName = uniformName;
        this.program = program;
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
        this.verticalFov = glMatrix.toRadian(fov);
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
        this.program.setUniform(new UniformMat4(this.uniformName, this.perspective));
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
