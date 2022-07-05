import type { TVec3 }	from 'oito';
import { Maths } 		from 'oito';

export default class Lissajous{
	// 5,1,5,1,2
	// 5,4,5,1,2
	// 5,4,5,4,2
	static at( t: number, radius=1, a=5, b=1, c=5, d=1, e=2, offsetRad:number, out:TVec3=[0,0,0] ): TVec3{
		// https://github.com/spite/looper/blob/master/loops/233.js#L124
		//let tt = Maths.TAU - (t * Maths.TAU + i * range / cnt + offset * i);
		const tt = t * Maths.TAU + offsetRad;
		out[ 0 ] = radius * Math.cos( a * tt ) + radius * Math.cos( b * tt );
		out[ 1 ] = radius * Math.sin( c * tt ) + radius * Math.sin( d * tt );
		out[ 2 ] = 2 * radius * Math.sin( e * tt );
		return out
	}


	// 3, 1, 1, 1, 0, 1
    // 5, 2, 1, 0, -2, 1 
    // 2, 3, 1, 0, 0.4, 1 
	static alt( t:number, xRng=3, yRng=1, zRng=1, xOffset=1, yOffset=0, zOffset=0, out:TVec3=[0,0,0] ): TVec3{
		// https://codepen.io/jstrutz/pen/pvXOdz
		const tAngle = t * Maths.TAU;
		out[ 0 ] = Math.sin(xRng * tAngle + xOffset);
		out[ 1 ] = Math.sin(yRng * tAngle + yOffset);
		out[ 2 ] = Math.sin(zRng * tAngle + zOffset);
		return out;
	}
}