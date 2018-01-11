/**
 * Stellt den Render Loop des Programmes dar. Der RenderLoop hält eine
 * Liste mit allen Elementen die gerendert werden sollen und managed den
 * GL-Kontext und den canvas.
 */
class RenderLoop {
    /**
     * Erzeugt einen neuen RenderLoop.
     * 
     * @param {ShaderProgram} program Das ShaderProgram, mit dem die
     * Elemente gerendert werden.
     * @param {HTMLCanvasElement} canvas Der canvas auf dem die Szene gerendert wird.
     */
    constructor(program, canvas) {
        this.program = program;
        this.canvas = canvas;
        this.drawables = [];
        this.nextUid = 0;

        window.addEventListener("resize", () => this.onResize());
        this.onResize();
    }

    /**
     * Startet den RenderLoop. Diese Methode ist async und blockiert 
     * den Caller nicht.
     */
    start() {
        this.program.use();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let elem of this.drawables) {
            elem.use(this.program);
            elem.draw();
        }

        window.requestAnimationFrame(() => this.start());
    }

    /**
     * Fügt ein Element hinzu, das gerendert werden soll. Ein Element muss 
     * eine draw() und ein use(program: ShaderProgram) Methode besitzen. 
     * 
     * @param {object} drawable Das Element, das gerendert werden soll.
     * @param {function} drawable.use Nimmt ein ShaderProgram als Argument und aktiviert das Drawable für
     * spätere Drawcalls.
     * @param {function} drawable.draw Zeichnet das Element.
     */
    addDrawable(drawable) {
        if (drawable.__renderId) {
            throw new Error("Diese Element wurde schon eingefügt.");
        }

        drawable.__renderId = this.nextUid;
        this.nextUid++;

        this.drawables.push(drawable);
    }

    /**
     * Entfernt ein Element, das momentan gerendert wird, aus dem RenderLoop.
     * 
     * @param {*} drawable Das Element, das nicht mehr gerendert werden soll.
     */
    removeDrawable(drawable) {
        const index = this.drawables.findIndex(elem => elem.__renderId === drawable.__renderId);
        this.drawables.splice(index, 1);
        drawable.__renderId = null;
    }

    /**
     * Fügt eine optionale Projektionsmatrix zum RenderLoop hinzu, deren Seitenverhältnis automatisch mit
     * bei einer Änderung aktualisiert wird.
     * 
     * @param {object} mat Eine Projektionsmatrix für das Shaderprogramm.
     * @param {function} mat.setRatio Setzt das Seitenverhältnis des Framebuffers für diese Projektion.
     * @param {function} mat.flushWith Führt die gegebene Funktion aus und flushed danach die Matrix.
     */
    setProjectionMatrix(mat) {
        this.projection = mat;
        this.onResize();
    }

    /**
     * Wird aufgerufen, wenn sich die Fenstergröße ändert.
     */
    onResize() {
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        if (this.projection) {
            this.projection.flushWith(_ => {
                this.projection.setRatio(this.canvas.width / this.canvas.height);
            });
        }
    }
}
