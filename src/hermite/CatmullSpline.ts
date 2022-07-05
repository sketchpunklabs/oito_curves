// #region IMPORTS
import { Spline, Point }    from '../Spline';
import Catmull              from './Catmull';
import type { TVec3 }       from 'oito';
import { Maths }            from 'oito';
// #endregion

export default class CatmullSpline extends Spline{
    // #region MANAGE POINTS
    add( pos: TVec3 ) : Point{
        const o = super.add( pos );
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
    at( t: number, pos ?: TVec3, dxdy ?: TVec3, dxdy2 ?: TVec3 ): void{
        if( t > 1 )      t = 1;
        else if( t < 0 ) t = 0;

        const p                  = this.points;
        const [ a, b, c, d, tt ] = ( !this._isLoop )?
            this._computeCurveIdx( t ) :
            this._computeLoopIdx( t ) ;

        if( pos )   Catmull.at(    p[a].pos, p[b].pos, p[c].pos, p[d].pos, tt, pos );
        if( dxdy )  Catmull.dxdy(  p[a].pos, p[b].pos, p[c].pos, p[d].pos, tt, dxdy );
        if( dxdy2 ) Catmull.dxdy2( p[a].pos, p[b].pos, p[c].pos, p[d].pos, tt, dxdy2 );
    }

    atCurve( cIdx: number, t: number, pos ?: TVec3, dxdy ?: TVec3, dxdy2 ?: TVec3  ): void{
        if( t > 1 )      t = 1;
        else if( t < 0 ) t = 0;

        const p = this.points;
        const a = cIdx;
        const b = Maths.mod( a + 1, this._pointCnt );
        const c = Maths.mod( a + 2, this._pointCnt );
        const d = Maths.mod( a + 3, this._pointCnt );

        if( pos )   Catmull.at(    p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, pos );
        if( dxdy )  Catmull.dxdy(  p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, dxdy );
        if( dxdy2 ) Catmull.dxdy2( p[a].pos, p[b].pos, p[c].pos, p[d].pos, t, dxdy2 );
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