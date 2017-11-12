function translateMat4(x, y) {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

function rotateZAxisMat4(rad) {
    return [
        Math.cos(rad), -Math.sin(rad), 0, 0,
        Math.sin(rad), Math.cos(rad), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

function transpose(mat) {
    const transposed = [];
    const size = Math.round(Math.sqrt(mat.length));

    for (let offset = 0; offset < size; offset++) {
        for (let stride = 0; stride <= 3 * size; stride += size) {
            transposed.push(mat[stride + offset]);
        }
    }

    return transposed;
}