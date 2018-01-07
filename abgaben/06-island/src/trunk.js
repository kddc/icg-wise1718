class Trunk extends Model {
  constructor(
    bottom = { from: { x: -0.5, z: -0.5 }, to: { x: 0.5, z: 0.5} },
    top = { from: { x: -1, z: -1 }, to: { x: 1, z: 1 } },
    sideColors,
    height = 1,
  ) {
    super(null, null, sideColors);

    this.bottom = bottom;
    this.top = top;
    this.height = height;

    this.makeModel();
    this.setModelMatrix(this.position, this.orientation);
    this.initBuffer();
  }

  makeModel (faktor) {
    const yposition = 0;
    this.mesh = [
      // Front
      this.bottom.from.x, yposition, this.bottom.from.z,
      this.top.from.x, yposition + this.height, this.top.from.z,
      this.top.to.x, yposition + this.height, this.top.from.z,

      this.top.to.x, yposition + this.height, this.top.from.z,
      this.bottom.to.x, yposition, this.bottom.from.z,
      this.bottom.from.x, yposition, this.bottom.from.z,

      // Right
      this.bottom.to.x, yposition, this.bottom.from.z,
      this.bottom.to.x, yposition, this.bottom.to.z,
      this.top.to.x, yposition + this.height, this.top.to.z,

      this.bottom.to.x, yposition, this.bottom.from.z,
      this.top.to.x, yposition + this.height, this.top.to.z,
      this.top.to.x, yposition + this.height, this.top.from.z,

      // Back
      this.bottom.from.x, yposition, this.bottom.to.z,
      this.top.from.x, yposition + this.height, this.top.to.z,
      this.top.to.x, yposition + this.height, this.top.to.z,

      this.top.to.x, yposition + this.height, this.top.to.z,
      this.bottom.to.x, yposition, this.bottom.to.z,
      this.bottom.from.x, yposition, this.bottom.to.z,

      // Left
      this.bottom.from.x, yposition, this.bottom.from.z,
      this.bottom.from.x, yposition, this.bottom.to.z,
      this.top.from.x, yposition + this.height, this.top.to.z,

      this.bottom.from.x, yposition, this.bottom.from.z,
      this.top.from.x, yposition + this.height, this.top.to.z,
      this.top.from.x, yposition + this.height, this.top.from.z,

      // Bottom
      this.bottom.from.x, yposition, this.bottom.to.z,
      this.bottom.from.x, yposition, this.bottom.from.z,
      this.bottom.to.x, yposition, this.bottom.from.z,

      this.bottom.from.x, yposition, this.bottom.to.z,
      this.bottom.to.x, yposition, this.bottom.to.z,
      this.bottom.to.x, yposition, this.bottom.from.z,

      // Top
      this.top.from.x, yposition + this.height, this.top.to.z,
      this.top.from.x, yposition + this.height, this.top.from.z,
      this.top.to.x, yposition + this.height, this.top.from.z,

      this.top.from.x, yposition + this.height, this.top.to.z,
      this.top.to.x, yposition + this.height, this.top.to.z,
      this.top.to.x, yposition + this.height, this.top.from.z,
    ]

    for (let i = 0; Math.floor(i/6) < 6; i++) {
      this.colors = this.colors.concat(Object.values(this.sideColors)[Math.floor(i/6)]);
    }

    this.normals = this.getNormals();
  }
}
