// #region IMPORTS
import { Spline, Point }    from '../Spline';
import type { TVec3 }       from 'oito';
import { Maths }            from 'oito';
// #endregion

export default class KochanekBartelsSpline extends Spline{
    // #region MAIN
    _tension    : number = 0;
    _continuity : number = 0;
    _bias       : number = 0;

    _inTang     = [0,0,0];
    _outTang    = [0,0,0];

    constructor( tension:number=0, continuity:number=0, bias:number=0 ){
        super();
        this._tension    = tension;
        this._continuity = continuity;
        this._bias       = bias;
    }
    // #endregion


    // #region MANAGE POINTS
    add( pos: TVec3, tension:number=this._tension, continuity:number=this._continuity, bias:number=this._bias ) : Point{
        const o = super.add( pos );
        o.attrib.tension    = tension;
        o.attrib.continuity = continuity;
        o.attrib.bias       = bias;

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

        this._precalcParams( tt, a, b, c, d );

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

        this._precalcParams( t, a, b, c, d );

        if( pos )  this._at(   p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, pos );
        if( dxdy ) this._dxdy( p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, dxdy );
    }
    // #endregion


    // #region OPTIMIZED HERMITE CURVE
    /** Precompute and cache values for every at call, for optimization */
    _precalcParams( t: number, ai:number, bi: number, ci: number, di: number ) : void{
        // Pre-caluate Paramters for Curve & Derivative Equations
        const ti = 1 - t;
        const a  = this.points[ ai ];
        const b  = this.points[ bi ];
        const c  = this.points[ ci ];
        const d  = this.points[ di ];

        // Lerp Tension and Bias between the main 2 points of the curve
        const tension      = ti * b.attrib.tension    + t * c.attrib.tension;
        const continuity   = ti * b.attrib.continuity + t * c.attrib.continuity;
        const bias         = ti * b.attrib.bias       + t * c.attrib.bias;
        
        const d0a          = ((1 - tension) * ( 1 + bias ) * (1 + continuity)) * 0.5;
        const d0b          = ((1 - tension) * ( 1 - bias ) * (1 - continuity)) * 0.5;
        const d1a          = ((1 - tension) * ( 1 + bias ) * (1 - continuity)) * 0.5;
        const d1b          = ((1 - tension) * ( 1 - bias ) * (1 + continuity)) * 0.5;

        // Incoming Tangent
        this._inTang[ 0 ]  = d0a * ( b.pos[0] - a.pos[0] ) + d0b * ( c.pos[0] - b.pos[0] ),	
        this._inTang[ 1 ]  = d0a * ( b.pos[1] - a.pos[1] ) + d0b * ( c.pos[1] - b.pos[1] ),
        this._inTang[ 2 ]  = d0a * ( b.pos[2] - a.pos[2] ) + d0b * ( c.pos[2] - b.pos[2] ),
        
        // Outgoing Tangent
        this._outTang[ 0 ] = d1a * ( c.pos[0] - b.pos[0] ) + d1b * ( d.pos[0] - c.pos[0] ),
        this._outTang[ 0 ] = d1a * ( c.pos[1] - b.pos[1] ) + d1b * ( d.pos[1] - c.pos[1] ),
        this._outTang[ 0 ] = d1a * ( c.pos[2] - b.pos[2] ) + d1b * ( d.pos[2] - c.pos[2] );
    }

    _at( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t:number, out: TVec3 ) : TVec3{
        const tt  = t * t;
        const ttt = tt * t;
        const t0  = this._inTang;
        const t1  = this._outTang;

        out    ??= [ 0, 0, 0 ];
        out[ 0 ] = b[0] + t0[0] * t + (- 3 * b[0] + 3 * c[0] - 2 * t0[0] - t1[0]) * tt + ( 2 * b[0] - 2 * c[0] + t0[0] + t1[0]) * ttt;
        out[ 1 ] = b[1] + t0[1] * t + (- 3 * b[1] + 3 * c[1] - 2 * t0[1] - t1[1]) * tt + ( 2 * b[1] - 2 * c[1] + t0[1] + t1[1]) * ttt;
        out[ 2 ] = b[2] + t0[2] * t + (- 3 * b[2] + 3 * c[2] - 2 * t0[2] - t1[2]) * tt + ( 2 * b[2] - 2 * c[2] + t0[2] + t1[2]) * ttt;
        return out;
    }

    _dxdy( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t:number, out: TVec3 ) : TVec3{
        const t0  = this._inTang;
        const t1  = this._outTang;
        const tt  = t * t;

        out    ??= [ 0, 0, 0 ];
        out[ 0 ] = t0[0] + (- 3 * b[0] + 3 * c[0] - 2 * t0[0] - t1[0]) * 2 * t + ( 2 * b[0] - 2 * c[0] + t0[0] + t1[0]) * 3 * tt;
        out[ 1 ] = t0[1] + (- 3 * b[1] + 3 * c[1] - 2 * t0[1] - t1[1]) * 2 * t + ( 2 * b[1] - 2 * c[1] + t0[1] + t1[1]) * 3 * tt;
        out[ 2 ] = t0[2] + (- 3 * b[2] + 3 * c[2] - 2 * t0[2] - t1[2]) * 2 * t + ( 2 * b[2] - 2 * c[2] + t0[2] + t1[2]) * 3 * tt;
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