class Leaf extends Model {
  constructor(rotation, from, to, colors, withLightning, withTexture, withBumpmap) {
    super(from, to, colors, withLightning, withTexture, withBumpmap);
    this.orientation = { x: 0, y: rotation, z: 0 };

    this.makeModel();
    this.setModelMatrix(this.position, this.orientation);
    this.initBuffer();
  }

  makeModel () {
    // https://raw.githubusercontent.com/jakobamb/ICG/master/05%20ISLAND/palm.js
    this.mesh = [
      // Front
      this.from.x , this.from.y, this.to.z,
      this.to.x + 2.5, this.from.y -0.4, this.to.z + 0.5,
      this.from.x, this.to.y - 0.6, this.to.z,

      this.to.x * 0, this.to.y -2 * 0, this.to.z * 0,
      this.from.x * 0, this.to.y -2 * 0, this.to.z * 0,
      this.to.x * 0, this.from.y -2 * 0, this.to.z * 0,

      // Right
      this.to.x * 0, this.to.y * 0, this.to.z * 0,
      this.to.x * 0, this.from.y * 0, this.to.z * 0,
      this.to.x * 0, this.from.y * 0, this.from.z * 0,

      this.to.x * 0, this.to.y * 0, this.from.z * 0,
      this.to.x * 0, this.to.y * 0, this.to.z * 0,
      this.to.x * 0, this.from.y * 0, this.from.z * 0,

      // Back
      this.from.x, this.from.y, this.from.z,
      this.to.x + 2.5, this.from.y - 0.4, this.from.z - 0.5,
      this.from.x, this.to.y - 0.6, this.from.z,

      this.to.x * 0, this.to.y * 0, this.from.z * 0 ,
      this.from.x * 0, this.to.y * 0, this.from.z * 0,
      this.to.x * 0, this.from.y * 0, this.from.z * 0,

      // Left
      this.from.x, this.to.y - 0.6, this.to.z,
      this.from.x, this.from.y , this.to.z,
      this.from.x, this.from.y, this.from.z,

      this.from.x, this.to.y - 0.6, this.from.z,
      this.from.x, this.to.y - 0.6 , this.to.z,
      this.from.x, this.from.y, this.from.z,

      // Bottom
      this.from.x, this.from.y, this.to.z,
      this.from.x, this.from.y, this.from.z,
      this.to.x + 2.5, this.from.y - 0.4, this.to.z + 0.5,

      this.to.x * 0, this.from.y * 0, this.from.z * 0,
      this.from.x * 0, this.from.y * 0, this.from.z * 0,
      this.to.x * 0, this.from.y * 0, this.to.z * 0,

      // Top
      this.from.x, this.to.y - 0.6, this.to.z,
      this.from.x, this.to.y - 0.6 , this.from.z,
      this.to.x + 2.5, this.to.y - 1 - 0.6 , this.to.z + 0.5,

      this.to.x * 0, this.to.y * 0, this.from.z * 0,
      this.from.x * 0, this.to.y * 0, this.from.z * 0,
      this.to.x * 0, this.to.y * 0, this.to.z * 0
    ]

    // for (let i = 0; Math.floor(i/6) < 6; i++) {
    //   this.colors = this.colors.concat(Object.values(this.sideColors)[Math.floor(i/6)]);
    // }

    this.normals = this.getNormals();
  }
}
