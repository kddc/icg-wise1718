/**
 * Repräsentiert ein VertexBufferObject.
 * 
 * @constructor
 * @param {Number[]} data Der Inhalt des Buffers.
 * @param {GLenum} [drawMode] Der Modus mit dem draw calls für diesen Buffer durchgeführt werden.
 */
function VertexArrayBuffer(data, drawMode) {
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
 */
VertexArrayBuffer.prototype.bind = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
}

/**
 * Fügt ein Shader-Attribut hinzu, das auf Daten in diesem Buffer zeigt.
 * 
 * @param {Attribute} attrib Das Attribut, das hinzugefügt wird.
 */
VertexArrayBuffer.prototype.addAttribute = function (attrib) {
    this.attributes.push(attrib);
}