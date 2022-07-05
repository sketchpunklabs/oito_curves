import type { TVec3 } from 'oito';
export default class Watts{

    /*
        https://www.mathcurve.com/courbes2d.gb/watt/watt.shtml
        Polar parametrization:
        d^2			= a^2 + b^2 - c^2
        length		= b * cos(t);
        sinTheta	= (d^2 - b^2 * cos(t)^2) / ( 2 * a * b * sin(t) )

        a : Distance between the center of 2 circles
        b : Radius of Circles
        c : Length of Rods
        a : Distance between the center of 2 circles
        b : Radius of Circles
        c : Length of Rods
    */

    static at( t:number, centerDist=1, radius=2, rodLen=1, out=[0,0,0] ): TVec3{
        const rad      = ( Math.PI * 2 ) * t;
        const cosT     = Math.cos( rad );
        const len      = radius * cosT;

        if( t == 0 ){
            out[ 0 ] = len * Math.cos( 0 );
            out[ 1 ] = len * Math.sin( 0 );
        }else{
            const radiusSq = radius * radius;
            const dd       = centerDist * centerDist + radiusSq - rodLen*rodLen;
            const theta    = ( dd - radiusSq * cosT * cosT ) / ( 2 * centerDist * radius * Math.sin( rad ) );
            out[ 0 ] = len * Math.cos( theta );
            out[ 1 ] = len * Math.sin( theta );
        }

        out[ 2 ] = 0;
        return out;
    }

}