/**
 * Repräsentiert ein VertexArrayBuffer Object.
 */
class VertexArrayBuffer {
    /**
     * Erzeugt einen neuen VertexArrayBuffer.
     * 
     * @constructor
     * @param {Number[]} data Der Inhalt des Buffers.
     * @param {GLenum} [drawMode] Der Modus mit dem draw calls für diesen Buffer durchgeführt werden.
     */
    constructor(data, drawMode) {
        if (!drawMode) {
            drawMode = gl.STATIC_DRAW;
        }

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), drawMode);

        this.buffer = buf;
        this.attributes = [];
    }

    /**
     * Aktiviert diesen Buffer.
     * 
     * @param {ShaderProgram} program Das zu benutzende Program.
     */
    use(program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        for (let attrib of this.buffer.attributes) {
            const pos = gl.getAttribLocation(program, attrib.name);

            if (pos === -1) {
                throw new Error(`Variable '${attrib.name}' does not exist in the shader.`);
            }

            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, attrib.length, attrib.type, false, attrib.stride, attrib.offset);
        }
    }

    /**
     * Fügt ein Shader-Attribut hinzu, das auf Daten in diesem Buffer zeigt.
     * 
     * @param {Attribute} attrib Das Attribut, das hinzugefügt wird.
     */
    addAttribute(attrib) {
        this.attributes.push(attrib);
    }
}