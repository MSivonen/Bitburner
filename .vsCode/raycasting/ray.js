class Ray {
    constructor(x_, y_, angle_, lightPower_ = 0.05) {
        this.pos = new Vec(x_, y_);
        this.end = new Vec();
        this.angle = angle_;
        this.direction = Vec.fromAngle(this.angle, 50);
        this.col = `rgba(255,255,100,${lightPower_}`;
        this.rayWidth = 1;
    }

    draw() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.col;
        this.update();
        //ctx.shadowColor = `rgba(255,255,100,1)`;
        //ctx.shadowBlur = 5;
        // ctx.shadowOffsetY = h;
        line(this.pos.x, this.pos.y, this.end.x, this.end.y);
    }

    update() {
        this.direction = Vec.fromAngle(this.angle, 750);
        let shortest = 99e99;
        let result = [];
        let p;
        walls.forEach(wall => {
            p = this.intersect(wall);
            if (p) {
                let distance = calc.dist(this.pos, { "x": p[0], "y": p[1] });
                if (distance < shortest) {
                    result = p;
                    shortest = distance;
                }
            }
        });
        if (result.length > 0) {
            this.end.x = result[0];
            this.end.y = result[1];
        }
        else {
            this.end.set(this.pos.x + this.direction.x, this.pos.y + this.direction.y);
        }
    }

    intersect(wall) {
        let x1 = this.pos.x,
            y1 = this.pos.y,
            x2 = this.pos.x + this.direction.x,
            y2 = this.pos.y + this.direction.y,
            x3 = wall.xs,
            y3 = wall.ys,
            x4 = wall.xe,
            y4 = wall.ye;

        let d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;

        if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
            let px = x1 + t * (x2 - x1);
            let py = y1 + t * (y2 - y1);
            //sellipse(px, py, 5);
            //console.log(px, py);
            return [px, py];
        }
        else {
            return null;
        }
    }
}