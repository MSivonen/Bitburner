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