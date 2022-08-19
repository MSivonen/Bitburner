class Person {
    constructor(x_, y_, fov_, numLights_ = -999, lightPower_) {
        this.numLights = numLights_;
        this.lightPower = lightPower_;
        this.fov = Math.PI / fov_;
        this.rayAngleStep = Math.PI / 2 / 360; //Math.PI / 180 == 1deg intervals
        this.x = x_;
        this.y = y_;
        this.angle = 0;
        this.rays = [];
        this.speed = 2;
        this.turnSpeed = 0.07;
        this.lights = [];
        this.lightDist = 2;
        this.lightWidth = 3;
        this.r = this.numLights * this.lightDist;
        for (let i = this.fov / -2; i < this.fov / 2; i += this.rayAngleStep) {
            this.rays.push(new Ray(this.x, this.y, i, lightPower_));
        }
        for (let i = numLights_ / -2; i <= numLights_ / 2; i += 1) {
            console.log(i);
            this.lights.push(new Person(this.x, this.y + i * this.lightDist, this.lightWidth, -999, 0.05));
        }

    }

    draw() {
        this.rays.forEach(r => r.draw());
        this.lights.forEach(l => l.draw());
        ctx.lineWidth = 0;
        ctx.fillStyle = "rgb(255,255,255)";
        if (this.lights.length > 0) circle(this.x, this.y, this.r);
    }

    update() {
        this.move();
        //this.updatePos();
        this.updateRays();
        this.lights.forEach(l => l.updateRays());
    }

    updatePos() {
        this.x = Math.min(Math.max(0, mouseX), w - 1);
        this.y = Math.max(Math.min(h - 1, mouseY), 0);
    }

    updateRays() {
        let iter = 0;
        for (const ray of this.rays) {
            ray.pos.x = this.x;
            ray.pos.y = this.y;
            ray.angle = this.angle + this.fov / -2 + iter * this.rayAngleStep;
            iter++;
        }
    }

    move() {
        let keysPressed = {
            "w": is_key_down("w"),
            "s": is_key_down("s"),
            "a": is_key_down("a"),
            "d": is_key_down("d")
        };
        if (this.lights.length > 0) {
            if (keysPressed.w) {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
            }
            if (keysPressed.s) {
                this.x -= Math.cos(this.angle) * this.speed;
                this.y -= Math.sin(this.angle) * this.speed;
            }
            if (keysPressed.a) {
                this.angle -= this.turnSpeed;
            }
            if (keysPressed.d) {
                this.angle += this.turnSpeed;
            }
        }

        this.x = Math.max(this.x, 10);
        this.y = Math.max(this.y, 10);
        this.x = Math.min(this.x, w - 10);
        this.y = Math.min(this.y, h - 10);

        let i = this.numLights / -2;
        for (const l of this.lights) {
            l.x = this.x + Math.cos(this.angle + Math.PI / 2) * this.lightDist * i;
            l.y = this.y + Math.sin(this.angle + Math.PI / 2) * this.lightDist * i;
            l.angle = this.angle;
            i += 1;
        }
    }
}

