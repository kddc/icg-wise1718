/**
 * Erstellt eine 4x4 Translationsmatrix, in row-major order.
 * 
 * @param {Number} x Der Betrag, um den in x-Richtung verschoben wird.
 * @param {Number} y Der Betrag, um den in y-Richtung verschoben wird.
 * @param {Number} z Der Betrag, um den in z-Richtung verschoben wird.
 * @returns {Number[]} Eine 4x4 Translationsmatrix für die gegebenen Werte.
 */
function translate(x, y, z) {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    ];
}

/**
 * Erstellt ein 4x4 Rotationsmatrix um die z-Achse, in row-major order.
 * 
 * @param {Number} rad Der Winkel, um den rotiert wird, in Bogenmaß.
 * @returns {Number[]} Eine 4x4 Rotationsmatrix für die gegebenen Werte.
 */
function rotateZAxis(rad) {
    return [
        Math.cos(rad), -Math.sin(rad), 0, 0,
        Math.sin(rad), Math.cos(rad), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

/**
 * Transponiert eine beliebige nxn Matrix.
 * 
 * @param {Number[]} mat Eine beliebige nxn Matrix.
 * @returns {Number[]} Die transponierte nxn Matrix.
 */
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