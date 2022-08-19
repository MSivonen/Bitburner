/** @param {NS} ns */
/** @param {import('..').NS} ns */
export async function main(ns) {
    let doc = eval("document");
    ns.tail();

    let logArea = doc.querySelector(".react-draggable:last-child .react-resizable:last-child");
    logArea.children[1].style.display = "none";
    logArea.style.width = "501px"; //default 500px
    logArea.style.height = "536px"; //default 500px
    const w = 500, h = 500;
    let canv = logArea.appendChild(doc.createElement("canvas")),
        ctx = canv.getContext("2d");
    canv.width = w;
    canv.height = h;

    ns.atExit(() => {
        canv.parentNode.removeChild(canv)
    });
    let person,
        walls = [];

    let calc;

    const is_key_down = (() => {
        const state = {};

        for (const press of ["w", "s", "a", "d"]) {
            window.addEventListener('keyup', (press) => state[press.key] = false);
            window.addEventListener('keydown', (press) => state[press.key] = true);
        }

        return (key) => state.hasOwnProperty(key) && state[key] || false;
    })();

    class Vec {
        constructor(x_, y_) {
            this.x = x_;
            this.y = y_;
        }

        static fromAngle(angle, len) {
            return new Vec(Math.cos(angle) * len, Math.sin(angle) * len);
        }

        sub(vv1, vv2) {
            return {
                x: vv1.x - vv2.x,
                y: vv1.y - vv2.y
            }
        }

        add(vv1, vv2) {
            return {
                x: vv1.x + vv2.x,
                y: vv1.y + vv2.y
            }
        }

        mult(vv, n) {
            return {
                x: vv.x * n,
                y: vv.y * n
            }
        }

        set(xx, yy) {
            this.x = xx;
            this.y = yy;
        }

        dot(vv1, vv2) {
            return vv1.x * vv2.x + vv1.y * vv2.y;
        }

        mag(vv) {
            return (Math.sqrt(vv.x ** 2 + vv.y ** 2));
        }

        dist(vv1, vv2) {
            return (Math.sqrt((vv1.x - vv2.x) ** 2 + (vv1.y - vv2.y) ** 2));
        }

        sqrt(n, a = 1 + n / 2) {
            a = (n / a + a) / 2;
            a = (n / a + a) / 2;
            return 0.5 * (n / a + a);
        }

        atan2(y, x) {
            let a = Math.min(Math.abs(x), Math.abs(y)) / Math.max(Math.abs(x), Math.abs(y))
            let s = a * a;
            let r = ((-0.0464964749 * s + 0.15931422) * s - 0.327622764) * s * a + a;
            if (Math.abs(y) > Math.abs(x)) r = 1.57079637 - r;
            if (x < 0) r = 3.14159274 - r;
            if (y < 0) r = -r;
            return r;
        }
    }

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

    function setup() {
        calc = new Vec(0, 0);
        person = new Person(200, 200, 0.5, 4, 0.01);
        for (let i = 0; i < 5; i++)
            walls.push(new Wall(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h));
        walls.push(new Wall(0, h, w, h));
    }

    setup();

    //let intervalID = window.setInterval(infLoop, 1000 / 60);

    let prevTime = 0;
    while (1) {
        if (prevTime + 1000 / 60 < performance.now()) {
            background("rgba(22,22,2,1)");
            person.update();
            person.draw();
            ctx.shadowBlur = 0;
            walls.forEach(wall => wall.draw());
            prevTime = performance.now();
        }
        await ns.sleep();
    }


    function circle(x, y, r) {
        ctx.beginPath()
        ctx.arc(x, y, r / 2, 0, 2 * Math.PI, false)
        ctx.stroke();
        ctx.fill();
    }

    function line(xs, ys, xe, ye) {
        ctx.beginPath();
        ctx.moveTo(xs, ys);
        ctx.lineTo(xe, ye);
        ctx.stroke();
    }

    function background(col) {
        ctx.fillStyle = col;
        ctx.fillRect(0, 0, canv.width, canv.height);
    }
}



