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
        this.mat = mat;
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

/**
 * Stellt eine Transformationsmatrix für eine Modell dar. Dieses Object speichert
 * und setzt die genaue Position des Modells im Weltkoordinatensystem.
 * 
 * Diese Klasse ist semantisch identisch zu einer UniformMat4, bietet aber Hilfsmethoden für
 * einfache Manipulation einer Modelmatrix.
 */
class Model {
    /**
     * Erzeugt eine neue Instanz von Model.
     * 
     * @param {String} uniformName Der Name des Uniforms für die Model Matrix.
     */
    constructor(uniformName) {
        this.uniformName = uniformName;
        this.mat = mat4.create();
    }

    /**
     * Verschiebt das Modell um einen gegebenen Vektor.
     * 
     * @param {Number[]} vec Der Übersetzungsvektor.
     */
    translate(vec) {
        mat4.translate(this.mat, this.mat4, vec);
    }

    /**
     * Skaliert das Modell um die in einem Vektor (x, y, z) gegebenen Faktoren.
     * 
     * @param {Number[]} dim Die Skalierungsfaktoren als Vec3.
     */
    scale(dim) {
        mat4.scale(this.mat, this.mat, dim);
    }

    /**
     * Rotiert das Modell um einen Winkel um eine Achse.
     * 
     * @param {Number[] | String} axis Die Achse, um die rotiert wird, als String für die Hauptachsen oder als Vec3.
     * @param {Number} angle Der Winkel, um den rotiert wird, in Grad.
     */
    rotate(axis, angle) {
        let axisVec;

        switch (axis) {
            case "x":
                axisVec = [1, 0, 0];
                break;
            case "y":
                axisVec = [0, 1, 0];
                break;
            case "z":
                axisVec = [0, 0, 1];
                break;
            default:
                axisVec = angle;
                break;
        }

        mat4.rotate(this.mat, this.mat, glMatrix.toRadian(angle), axisVec);
    }

    /**
     * Löscht alle Transformationen und stellt eine Identitätsmatrix her.
     */
    clear() {
        this.mat = mat4.create();
    }

    /**
     * Setzt die Model-Matrix für ein ShaderProgram.
     * 
     * @param {WebGLProgram} program Das Programm, für das diese Model-Matrix gesetzt wird.
     */
    set(program) {
        const uniform = gl.getUniformLocation(program, this.uniformName);
        gl.uniformMatrix4fv(uniform, false, this.mat);
    }
}
