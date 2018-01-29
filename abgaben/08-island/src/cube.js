class Cube extends Model {
  constructor(from, to, colors, withLightning, withTexture, withBumpmap) {
    super(from, to, colors, withLightning, withTexture, withBumpmap);
    this.setModelMatrix(this.position, this.orientation);
    this.makeModel();
    this.initBuffer();
  }

  /**
   * Makes the model, namely the mesh and the colors arrays
   */
  makeModel () {
    this.mesh = [
      // Front
      this.from.x, this.from.y, this.to.z,
      this.to.x, this.from.y, this.to.z,
      this.from.x, this.to.y, this.to.z,

      this.to.x, this.to.y, this.to.z,
      this.from.x, this.to.y, this.to.z,
      this.to.x, this.from.y, this.to.z,

      // Right
      this.to.x, this.to.y, this.to.z,
      this.to.x, this.from.y, this.to.z,
      this.to.x, this.from.y, this.from.z,

      this.to.x, this.to.y, this.from.z,
      this.to.x, this.to.y, this.to.z,
      this.to.x, this.from.y, this.from.z,

      // Back
      this.from.x, this.from.y, this.from.z,
      this.to.x, this.from.y, this.from.z,
      this.from.x, this.to.y, this.from.z,

      this.to.x, this.to.y, this.from.z,
      this.from.x, this.to.y, this.from.z,
      this.to.x, this.from.y, this.from.z,

      // Left
      this.from.x, this.to.y, this.to.z,
      this.from.x, this.from.y, this.to.z,
      this.from.x, this.from.y, this.from.z,

      this.from.x, this.to.y, this.from.z,
      this.from.x, this.to.y, this.to.z,
      this.from.x, this.from.y, this.from.z,

      // Bottom
      this.from.x, this.from.y, this.to.z,
      this.from.x, this.from.y, this.from.z,
      this.to.x, this.from.y, this.to.z,

      this.to.x, this.from.y, this.from.z,
      this.from.x, this.from.y, this.from.z,
      this.to.x, this.from.y, this.to.z,

      // Top
      this.from.x, this.to.y, this.to.z,
      this.from.x, this.to.y, this.from.z,
      this.to.x, this.to.y, this.to.z,

      this.to.x, this.to.y, this.from.z,
      this.from.x, this.to.y, this.from.z,
      this.to.x, this.to.y, this.to.z
    ]

    // for (let i = 0; Math.floor(i/6) < 6; i++) {
    //   this.colors = this.colors.concat(Object.values(this.sideColors)[Math.floor(i/6)]);
    // }

    // TODO: Setze die Normalen - ähnlich zu den Positionen
		// (Merke: eine Normale ist ein Richtungs- und kein Positionsvektor)
    // this.normals = this.getNormals();
    this.normals = [
			//Front
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,

			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,

			//Right
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,

			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,

			//Back
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,

			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,

			//Left
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,

			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,

			//Bottom
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,

			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,

			//Top
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,

			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0
		];
    // this.normals = this.getNormals();

    this.textureCoordinates = [
			// Front
			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0,

			0.0, 1.0,
			1.0, 1.0,
			0.0, 0.0,

			// Right
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,

			0.0, 1.0,
			1.0, 1.0,
			0.0, 0.0,

			// Back
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,

			1.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,

			// Left
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,

			1.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,

			// Bottom
			0.0, 1.0,
			0.0, 0.0,
			1.0, 1.0,

			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0,

			// Top
			0.0, 1.0,
			0.0, 0.0,
			1.0, 1.0,

			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0
		];
  }
}
