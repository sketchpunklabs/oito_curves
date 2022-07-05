import type { TVec3 } from 'oito';
import { vec3 }       from 'oito';

export class Point{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attrib : any           = {};
    pos    : Array<number> = [ 0, 0, 0 ];
    constructor( pos: TVec3 ){
        vec3.copy( pos, this.pos );
    }
}

export class Spline{
    // #region MAIN
    points : Array<Point> = []; // All the Points that defines all the curves of the Spline
    _curveCnt  = 0;             // How many curves make up the spline
    _pointCnt  = 0;             // Total points in spline
    _isLoop    = false;         // Is the spline closed? Meaning should the ends be treated as another curve
    // #endregion

    // #region GETTERS / SETTERS
    set isLoop( b: boolean ){ this._isLoop = b; }
    get isLoop(): boolean{ return this._isLoop; }

    get curveCount() : number{ return this._curveCnt; }
    get pointCount() : number{ return this._pointCnt; }
    // #endregion

    // #region MANAGE POINTS
    /** Add Points to the spline */
    add( pos: TVec3 ) : Point{
        const o = new Point( pos );
        this.points.push( o );
        this._pointCnt = this.points.length;
        // TODO - Each subclass has to update the curveCount
        return o;
    }

    /** Update point position */
    setPos( idx: number, pos: TVec3 ) : this{
        vec3.copy( pos, this.points[ idx ].pos );
        return this;
    }
    // #endregion

    // #region ABSTRACT METHODS
    at( t: number, pos ?: TVec3 ) : TVec3{
        return pos || [0,0,0];
    }
    // #endregion
}