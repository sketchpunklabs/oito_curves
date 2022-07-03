class SplineMap{
	arc_len		= 0;	// Total Length of the Spline
	curve_cnt 	= 0;	// How many curves in spline
	samp_per 	= 0;	// How many samples per curve
	samp_cnt 	= 0;	// Total Sample Count
	len_ary 	= null;	// Total length at each sample 
	inc_ary 	= null;	// Length Traveled at each samples
	time_ary 	= null; // Curve T Value at each samples
	//spline 		= null;	// Reference to Spline

	constructor( s=null, samp_cnt=5 ){
		if( s ) this.from_spine( s, samp_cnt );
	}

	from_spine( s, samp_cnt=5 ){
		//this.spline 	= s;
		this.curve_cnt	= s.curve_count();
		this.samp_per 	= samp_cnt;
		this.samp_cnt	= this.curve_cnt * samp_cnt + 1;
		this.len_ary 	= new Array( this.samp_cnt );
		this.inc_ary	= new Array( this.samp_cnt );
		this.time_ary	= new Array( this.samp_cnt );
	
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let v0	= new Vec3(),
			v1	= new Vec3(),
			a	= 1, 
			i, j, t, len;

		s.at( 0, v0 );
		this.len_ary[ 0 ]	= 0;
		this.inc_ary[ 0 ]	= 0;
		this.time_ary[ 0 ]	= 0;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		for( i=0; i < this.curve_cnt; i++ ){				// One Iteration Per Curve
			for( j=1; j <= samp_cnt; j++ ){					// One Iteractin per Sample on 1 Curve
				t = j / samp_cnt;							// Time on the curve
				s.at_curve( i, t, v1 );						// Get Position of the curve

				//.................................
				len 				= Vec3.len( v0, v1 );
				this.arc_len		+= len;					// Total Length
				this.len_ary[ a ]	= this.arc_len;			// Current Total Length
				this.inc_ary[ a ]	= len;					// Length between Current+Previous Point
				this.time_ary[ a ]	= i + t;				// Time Curve Step

				//.................................
				v0.copy( v1 );								// Save for next loop
				a++;										// Move Array Index up
			}
		}
		return this;
	}

	// Compute the Spline's T Value based on a specific length of the curve
	at_len( len, a=null, b=null ){
		if( a == null ) a = 0;
		if( b == null ) b = this.samp_cnt-2;

		for( let i=b; i >= a; i-- ){
			if( this.len_ary[ i ] < len ){
				let tt	= ( len - this.len_ary[ i ] ) / this.inc_ary[ i+1 ]; 		// Normalize the Search Length   ( x-a / b-a )
				let ttt	= this.time_ary[ i ] * (1-tt) + this.time_ary[ i+1 ] * tt;	// Interpolate the Curve Time between two points
				return ttt / this.curve_cnt;	// Since time saved as as Curve# + CurveT, Normalize it based on total time which is curve count
			}
		}
		return 0;
	}

	// Get Spline T based on Time of Arc Length
	at( t ){
		if( t >= 1 ) return 1;
		if( t <= 0 ) return 0;
		return this.at_len( this.arc_len * t );
	}

	// Get Spline T based on Time between Two Main Points on the Spline
	at_range( a, b, t ){
		let ai 	= a * this.samp_per,
			bi	= b * this.samp_per,
			len	= this.len_ary[ ai ] * (1-t) + this.len_ary[ bi ] * t;
		return this.at_len( len, ai, bi );
	}
}