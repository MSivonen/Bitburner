class Wall {
    constructor(xs_, ys_, xe_, ye_) {
        this.xs = xs_;
        this.ys = ys_;
        this.xe = xe_;
        this.ye = ye_;
    }

    draw() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(55,155,55)";
        line(this.xs, this.ys, this.xe, this.ye);
    }
}