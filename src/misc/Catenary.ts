import type { TVec3 }       from 'oito';
import { vec3 }             from 'oito';

export default class Caternary{
    // Feed it a Sag Factor( A ) and the X of the Graph when plotting the curve, 
    // will return the Y of the curve.
    static get( A: number, x: number ): number{ return A * Math.cosh( x / A ); }

    // A = Sagging Factor of the Curve. Need Length between the ends & Total Possible Length between the 2 points
    static computeSag( len: number, maxLen: number, tries=100 ): number | null{
        // Solution for Solving for A was found at http://rhin.crai.archi.fr/rld/plugin_details.php?id=990
        // I've since have modified from the original function, removing yDelta and sqrts
        // Note: This seems like newton's method for solving roots ??
        if( len > maxLen ) return null;

        const hLen          = len    * 0.5;
        const hMaxLen       = maxLen * 0.5;
        let e   : number    = Number.MAX_VALUE;
        let a   : number    = 100;
        let tmp : number    = 0;

        for( let i=0; i < tries; i++ ){
            tmp	= hLen / Math.asinh( hMaxLen / a );
            e   = Math.abs( ( tmp - a ) / a );
            a	= tmp;
            if( e < 0.001 ) break;
        }

        return a;
    }

    static fromEndPoints( p0: TVec3, p1: TVec3, maxLen: number, segments=5, invert=false ): Array<TVec3>{
        const vecLen = vec3.len( p0, p1 );
        const A      = this.computeSag( vecLen, maxLen );
        if( A == null ) return [];

        segments                += 1;                        // Skipping Zero, so need to add one to return the requested segment count

        const hVecLen            = vecLen * 0.5;
        const offset             = this.get( A, -hVecLen );  // Need starting C to base things at Zero, subtract offset from each c point
        const step               = vecLen / segments;	     // Size of Each Segment
        const rtn : Array<TVec3> = [];

        let pnt   : TVec3;
        let x     : number;
        let c     : number;

        for( let i=1; i < segments; i++ ){
            pnt     = vec3.lerp( p0, p1, i / segments, [0,0,0] );
            x       = i * step - hVecLen;         // x position between two points but using half as zero center
            c       = offset - this.get( A, x );  // Get a y value, but needs to be changed to work with coord system
            //c     = offset - this.get( A, t - 0.5 ); // Further testing is needed but maybe able to get away just using a T value between -0.5 > 0.5 in place of X
            pnt[1]  = ( !invert )? pnt[1] - c : pnt[1] + c;

            rtn.push( pnt );
        }

        return rtn;
    }
}