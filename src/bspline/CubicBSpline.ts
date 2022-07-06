import type { TVec3 } from 'oito';

// https://github.com/Zolniu/DigitalRune/blob/master/Source/DigitalRune.Mathematics/Interpolation/BSplineSegment3F.cs
// https://en.wikipedia.org/wiki/De_Boor%27s_algorithm
// https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/de-Boor.html

export default class CubicBSpline{
    static at( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out: TVec3 = [0,0,0] ) : TVec3{
        // (-t3 + 3 * t2 - 3 * t + 1) * a[0]
        //  + (3 * t3 - 6 * t2 + 4) * b[0]
        //  + (-3 * t3 + 3 * t2 + 3 * t + 1) * c[0]
        //  + (t3) * d[0]
        //  ) / 6;
        
        const t2 = t * t;
        const t3 = t2 * t;
        const aa = -t3 + 3 * t2 - 3 * t + 1;
        const bb = 3 * t3 - 6 * t2 + 4;
        const cc = -3 * t3 + 3 * t2 + 3 * t + 1;

        out[ 0 ] = ( aa * a[0] + bb * b[0] + cc * c[0] + t3 * d[0] ) / 6;
        out[ 1 ] = ( aa * a[1] + bb * b[1] + cc * c[1] + t3 * d[1] ) / 6;
        out[ 2 ] = ( aa * a[2] + bb * b[2] + cc * c[2] + t3 * d[2] ) / 6;
        return out;
    }

    static dxdy( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out: TVec3 = [0,0,0] ) : TVec3{
        // ((- 3 * u2 + 3 * 2 * u - 3) * Point1
        // + (3 * 3 * u2 - 6 * 2* u) * Point2
        // + (-3 * 3 * u2 + 3 * 2 * u + 3) * Point3
        // + (3 * u2) * Point4
        // ) / 6;

        const t2 = t * t;
        const aa = - 3 * t2 + 3 * 2 * t - 3;
        const bb = 3 * 3 * t2 - 6 * 2 * t;
        const cc = -3 * 3 * t2 + 3 * 2 * t + 3;
        const dd = 3 * t2;

        out[ 0 ] = ( aa * a[0] + bb * b[0] + cc * c[0] + dd * d[0] ) / 6;
        out[ 1 ] = ( aa * a[1] + bb * b[1] + cc * c[1] + dd * d[1] ) / 6;
        out[ 2 ] = ( aa * a[2] + bb * b[2] + cc * c[2] + dd * d[2] ) / 6;
        return out;
    }
}