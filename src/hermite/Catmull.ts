import type { TVec3 } from 'oito';

export default class Catmull{
    static at( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out ?: TVec3 ) : TVec3{
        // https://www.mvps.org/directx/articles/catmull/
        // q(t) = 0.5 * ( (2 * P1) + (-P0 + P2) * t + (2*P0 - 5*P1 + 4*P2 - P3) * t^2 + (-P0 + 3*P1- 3*P2 + P3) * t^3)
        const   t2 = t * t,
                t3 = t * t2;

        out    ??= [ 0, 0, 0 ]; 
        out[ 0 ] = (-0.5*a[0] + 1.5*b[0] - 1.5*c[0] + 0.5*d[0]) * t3 + (a[0] - 2.5*b[0] + 2*c[0] - 0.5*d[0]) * t2 + (-0.5*a[0] + 0.5*c[0]) * t + b[0];
        out[ 1 ] = (-0.5*a[1] + 1.5*b[1] - 1.5*c[1] + 0.5*d[1]) * t3 + (a[1] - 2.5*b[1] + 2*c[1] - 0.5*d[1]) * t2 + (-0.5*a[1] + 0.5*c[1]) * t + b[1];
        out[ 2 ] = (-0.5*a[2] + 1.5*b[2] - 1.5*c[2] + 0.5*d[2]) * t3 + (a[2] - 2.5*b[2] + 2*c[2] - 0.5*d[2]) * t2 + (-0.5*a[2] + 0.5*c[2]) * t + b[2];

        return out;
    }

    static dxdy( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out ?: TVec3 ) : TVec3{
        // www.wolframalpha.com : 0.5 (-P0 + P2 + 2 (2 P0 - 5 P1 + 4 P2 - P3) t + 3 (-P0 + 3 P1 - 3 P2 + P3) t^2)
        const   t2 = t * t;

        out    ??= [ 0, 0, 0 ]; 
        out[ 0 ] = 0.5 * (-a[0] + c[0] + 2 * (2*a[0] - 5*b[0] + 4*c[0] - d[0]) * t + 3 * ( -a[0] + 3*b[0] - 3*c[0] + d[0] ) * t2 );
        out[ 1 ] = 0.5 * (-a[1] + c[1] + 2 * (2*a[1] - 5*b[1] + 4*c[1] - d[1]) * t + 3 * ( -a[1] + 3*b[1] - 3*c[1] + d[1] ) * t2 );
        out[ 2 ] = 0.5 * (-a[2] + c[2] + 2 * (2*a[2] - 5*b[2] + 4*c[2] - d[2]) * t + 3 * ( -a[2] + 3*b[2] - 3*c[2] + d[2] ) * t2 );
        return out;
    }

    static dxdy2( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out ?: TVec3 ) : TVec3{
        // www.wolframalpha.com : 2. P0 - 5. P1 + 4. P2 - 1. P3 + 3. (-P0 + 3 P1 - 3 P2 + P3) t

        out    ??= [ 0, 0, 0 ]; 
        out[ 0 ] = 2*a[0] - 5*b[0] + 4*c[0] - 1*d[0] + 3 * (-a[0] + 3*b[0] - 3*c[0] + d[0]) * t;
        out[ 1 ] = 2*a[1] - 5*b[1] + 4*c[1] - 1*d[1] + 3 * (-a[1] + 3*b[1] - 3*c[1] + d[1]) * t;
        out[ 2 ] = 2*a[2] - 5*b[2] + 4*c[2] - 1*d[2] + 3 * (-a[2] + 3*b[2] - 3*c[2] + d[2]) * t;
        return out;
    }
}

/*
// http://paulbourke.net/miscellaneous/interpolation/
fucntion catmull( t, a, b, c, d ){
    let t2 = t*t;
    let a0 = -0.5*a + 1.5*b - 1.5*c + 0.5*d;
    let a1 = a - 2.5*b + 2*c - 0.5*d;
    let a2 = -0.5*a + 0.5*c;
    let a3 = b;
    return a0*t*t2 + a1*t2 + a2*t + a3;
}
*/