// #region IMPORTS
import { Spline, Point }    from '../Spline';
import type { TVec3 }       from 'oito';
import { Maths }            from 'oito';
// #endregion

export default class HermiteSpline extends Spline{
    // #region MAIN
    _tension  : number = 0;
    _bias     : number = 0;
    _tenBiasN : number = 0; // Optimize
    _tenBiasP : number = 0;

    constructor( tension:number=0, bias:number=0 ){
        super();
        this._tension = tension;
        this._bias    = bias;
    }
    // #endregion


    // #region MANAGE POINTS
    add( pos: TVec3, tension:number=this._tension, bias:number=this._bias ) : Point{
        const o = super.add( pos );
        o.attrib.tension = tension;
        o.attrib.bias    = bias;

        this._curveCnt   = ( !this._isLoop )?
            Math.max( 0, this._pointCnt - 3 ) :
            this._pointCnt;

        return o;
    }
    // #endregion


    // #region GETTERS
    get curveCount() : number{ 
        return ( !this._isLoop )? this._curveCnt : this._pointCnt;
    }
    // #endregion


    // #region SPLINE OPERATIONS
    /** Get Position and Dertivates of the Spline at T */
    at( t: number, pos ?: TVec3, dxdy ?: TVec3 ): void{
        if( t > 1 )      t = 1;
        else if( t < 0 ) t = 0;

        const p                  = this.points;
        const [ a, b, c, d, tt ] = ( !this._isLoop )?
            this._computeCurveIdx( t ) :
            this._computeLoopIdx( t ) ;

        this._precalcParams( tt, b, c );

        if( pos )  this._at(   p[a].pos, p[b].pos, p[c].pos, p[d].pos, tt, pos );
        if( dxdy ) this._dxdy( p[a].pos, p[b].pos, p[c].pos, p[d].pos, tt, dxdy );
    }

    atCurve( cIdx: number, t: number, pos ?: TVec3, dxdy ?: TVec3 ): void{
        if( t > 1 )      t = 1;
        else if( t < 0 ) t = 0;

        const p = this.points;
        const a = cIdx;
        const b = Maths.mod( a + 1, this._pointCnt );
        const c = Maths.mod( a + 2, this._pointCnt );
        const d = Maths.mod( a + 3, this._pointCnt );

        this._precalcParams( t, b, c );

        if( pos )  this._at(   p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, pos );
        if( dxdy ) this._dxdy( p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, dxdy );
    }
    // #endregion


    // #region OPTIMIZED HERMITE CURVE
    /** Precompute and cache values for every at call, for optimization */
    _precalcParams( t: number, bi: number, ci: number ) : void{
        // Pre-caluate Paramters for Curve & Derivative Equations
        const ti         = 1 - t;

        // Lerp Tension and Bias between the main 2 points of the curve
        const tension    = ti * this.points[ bi ].attrib.tension + t * this.points[ ci ].attrib.tension;
        const bias       = ti * this.points[ bi ].attrib.bias    + t * this.points[ ci ].attrib.bias;

        // Main Equation uses these values 4 times per component, Better
        // to precompute now for optimization
        this._tenBiasN	 = ( 1 - bias ) * ( 1 - tension ) * 0.5;
        this._tenBiasP	 = ( 1 + bias ) * ( 1 - tension ) * 0.5;
    }

    _at( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t:number, out: TVec3 ) : TVec3{
        const   t2 = t * t,
                t3 = t2 * t,
                a0 = 2*t3 - 3*t2 + 1,
                a1 = t3 - 2*t2 + t,
                a2 = t3 - t2,
                a3 = -2*t3 + 3*t2;

        out[ 0 ] = a0*b[0] + a1 * ( (b[0]-a[0]) * this._tenBiasP + (c[0]-b[0]) * this._tenBiasN ) + a2 * ( (c[0]-b[0]) * this._tenBiasP + (d[0]-c[0]) * this._tenBiasN ) + a3*c[0];
        out[ 1 ] = a0*b[1] + a1 * ( (b[1]-a[1]) * this._tenBiasP + (c[1]-b[1]) * this._tenBiasN ) + a2 * ( (c[1]-b[1]) * this._tenBiasP + (d[1]-c[1]) * this._tenBiasN ) + a3*c[1];
        out[ 2 ] = a0*b[2] + a1 * ( (b[2]-a[2]) * this._tenBiasP + (c[2]-b[2]) * this._tenBiasN ) + a2 * ( (c[2]-b[2]) * this._tenBiasP + (d[2]-c[2]) * this._tenBiasN ) + a3*c[2];
        return out;
    }

    _dxdy( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t:number, out: TVec3 ) : TVec3{
        const   tt  = t * t,
                tt6 = 6 * tt,
                tt3 = 3 * tt,
                a0  = tt6 - 6*t,
                a1  = tt3 - 4*t + 1,
                a2  = tt3 - 2*t,
                a3  = 6*t - tt6;

         out[ 0 ] = a0 * b[0] + a1 * ( (b[0]-a[0]) * this._tenBiasP + (c[0]-b[0]) * this._tenBiasN ) + a2 * ( (c[0]-b[0]) * this._tenBiasP  + (d[0]-c[0]) * this._tenBiasN ) + a3 * c[0];
         out[ 1 ] = a0 * b[1] + a1 * ( (b[1]-a[1]) * this._tenBiasP + (c[1]-b[1]) * this._tenBiasN ) + a2 * ( (c[1]-b[1]) * this._tenBiasP  + (d[1]-c[1]) * this._tenBiasN ) + a3 * c[1];
         out[ 2 ] = a0 * b[2] + a1 * ( (b[2]-a[2]) * this._tenBiasP + (c[2]-b[2]) * this._tenBiasN ) + a2 * ( (c[2]-b[2]) * this._tenBiasP  + (d[2]-c[2]) * this._tenBiasN ) + a3 * c[2];
         return out;
    }
    // #endregion


    // #region HELPERS
    /** Compute the point indices for open spline : Return: [ aIdx, bIdx, cIdx, dIdx, t ] */
    _computeCurveIdx( t: number ) : [number,number,number,number,number]{
        let i, tt;

        if( t != 1 ){
            tt  = t * this._curveCnt;   // Using Curve count as a way to get the Index and the remainder is the T of the curve
            i   = tt | 0;	            // BitwiseOR 0 same op as Floor
            tt -= i;		            // Strip out the whole number to get the decimal to be used for the T of curve ( FRACT )
        }else{
            i	= ( this._curveCnt - 1 );
            tt	= 1;                        // The end of the final curve.
        }

        return [ i, i+1, i+2, i+3, tt ];
    }

    /** Compute the point indices for closed spline : Return: [ aIdx, bIdx, cIdx, dIdx, t ] */
    _computeLoopIdx( t: number ) : [number,number,number,number,number]{
        let i, tt;

        if( t != 1 ){
            tt  = t * this._pointCnt;  
            i   = tt | 0;	            // BitwiseOR 0 same op as Floor
            tt -= i;		            // Strip out the whole number to get the decimal to be used for the T of curve ( FRACT )
        }else{
            i	= this._pointCnt - 1;
            tt	= 1;                    // The end of the final curve.
        }

        return [ 
            i, 
            Maths.mod( i+1, this._pointCnt ), 
            Maths.mod( i+2, this._pointCnt ), 
            Maths.mod( i+3, this._pointCnt ), 
            tt
        ];
    }
    // #endregion
}