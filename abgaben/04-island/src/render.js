/**
 * Stellt den Render Loop des Programmes dar. Der RenderLoop hält eine
 * Liste mit allen Elementen die gerendert werden sollen.
 */
class RenderLoop {
    /**
     * Erzeugt einen neuen RenderLoop
     */
    constructor() {
        this.drawables = [];
        this.nextUid = 0;
    }

    /**
     * Startet den RenderLoop. Diese Methode is async on blockiert 
     * den Caller nicht.
     */
    start() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (let elem of this.drawables) {
            elem.draw();
        }

        window.requestAnimationFrame(() => this.start());
    }

    /**
     * Fügt ein Element hinzu, das gerendert werden soll. Ein Element muss 
     * eine draw() Methode besitzen.
     * 
     * @param {*} drawable Das Element, das gerendert werden soll.
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
}
