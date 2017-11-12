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

VertexArrayBuffer.prototype.bind = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
}

VertexArrayBuffer.prototype.addAttribute = function (attrib) {
    this.attributes.push(attrib);
}