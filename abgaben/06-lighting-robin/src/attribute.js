/**
 * Eine WebGL Attribut Definition für einen Shader.
 */
class Attribute {
    /**
     * Erzeugt ein neues Attribut.
     * 
     * @constructor
     * @param {String} name Der Name des Attributs im Shader.
     * @param {Number} length Die Länge des Attributs in Anzahl der Werte von type.
     * @param {GLenum} type Der Typ der Werte im Attribut.
     * @param {Number} stride Der Abstand zu den nächsten Werten des Attributs im Buffer, in Bytes.
     * @param {Number} offset Der Offset, ab dem die Werte im Buffer liegen, in Bytes.
     */
    constructor(name, length, type, stride, offset) {
        this.name = name;
        this.length = length;
        this.type = type;
        this.stride = stride;
        this.offset = offset;
    }
}
