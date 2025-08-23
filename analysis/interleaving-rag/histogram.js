const isObject  = (x)   => {typeof x === 'object' && !Array.isArray(x) && x !== null }
const ascending = (a,b) => {a<b?-1:1};

function quantile( arr, p, opts ) {
	if ( !Array.isArray( arr ) ) {
		throw new TypeError( 'quantile()::invalid input argument. First argument must be an array.' );
	}
	if ( typeof p !== 'number' || p !== p ) {
		throw new TypeError( 'quantile()::invalid input argument. Quantile probability must be numeric.' );
	}
	if ( p < 0 || p > 1 ) {
		throw new TypeError( 'quantile()::invalid input argument. Quantile probability must be on the interval [0,1].' );
	}
	if ( arguments.length > 2 ) {
		if ( !isObject( opts ) ) {
			throw new TypeError( 'quantile()::invalid input argument. Options must be an object.' );
		}
		if ( opts.hasOwnProperty( 'sorted' ) && typeof opts.sorted !== 'boolean' ) {
			throw new TypeError( 'quantile()::invalid input argument. Sorted flag must be a boolean.' );
		}
		if ( opts.hasOwnProperty( 'method' ) && typeof opts.method !== 'string' ) {
			throw new TypeError( 'quantile()::invalid input argument. Method must be a string.' );
		}
		// TODO: validate that the requested method is supported. list.indexOf( method )
	} else {
		opts = {};
	}
	var len = arr.length,
		id;

	if ( !opts.sorted ) {
		arr = arr.slice();
		arr.sort( ascending );
	}

	// Cases...

	// [0] 0th percentile is the minimum value...
	if ( p === 0.0 ) {
		return arr[ 0 ];
	}
	// [1] 100th percentile is the maximum value...
	if ( p === 1.0 ) {
		return arr[ len-1 ];
	}
	// Calculate the vector index marking the quantile:
	id = ( len*p ) - 1;

	// [2] Is the index an integer?
	if ( id === Math.floor( id ) ) {
		// Value is the average between the value at id and id+1:
		return ( arr[ id ] + arr[ id+1 ] ) / 2.0;
	}
	// [3] Round up to the next index:
	id = Math.ceil( id );
	return arr[ id ];
}

function computeIQR( arr, opts ) {
	if ( !Array.isArray( arr ) ) {
		throw new TypeError( 'iqr()::invalid input argument. Must provide an array.' );
	}
	if ( arguments.length > 1 ) {
		if ( !isObject( opts ) ) {
			throw new TypeError( 'iqr()::invalid input argument. Options should be an object.' );
		}
	} else {
		opts = {
			'sorted': false
		};
	}
	if ( !opts.sorted ) {
		arr = arr.slice();
		arr.sort( ascending );
		opts.sorted = true;
	}
	return quantile( arr, 0.75, opts ) - quantile( arr, 0.25, opts );
}

export function histogram(arr, numBins, trimTailPercentage) {
	numBins = numBins||0;
	trimTailPercentage=trimTailPercentage||0.00;
    let dataCopy = arr.sort((a, b) => a - b);

    if (trimTailPercentage !== 0.00) {
        const rightPercentile = dataCopy[Math.floor((1.0 - trimTailPercentage) * dataCopy.length - 1)];
        const leftPercentile = dataCopy[Math.ceil(trimTailPercentage * dataCopy.length - 1)];
        dataCopy = dataCopy.filter(x => x <= rightPercentile && x >= leftPercentile);
    }

    const min = dataCopy[0];
    const max = dataCopy[dataCopy.length - 1];

    if(numBins === 0){
        const sturges = Math.ceil(Math.log2(dataCopy.length)) + 1;
        const iqr = computeIQR(dataCopy);
        // If IQR is 0, fd returns 1 bin. This is as per the NumPy implementation:
        //   https://github.com/numpy/numpy/blob/master/numpy/lib/histograms.py#L138
        let fdbins = 1;
        if(iqr !== 0.0) {
            const fd = 2.0 * (iqr / Math.pow(dataCopy.length, (1.0 / 3.0)));
            fdbins = Math.ceil((max - min) / fd);
        }
        numBins = Math.max(sturges, fdbins);
    }
    const bins = new Array(numBins ? numBins: 0).fill([0,0]).map((_, i) => [i, 0]);

    const binSize = (max - min) / numBins === 0 ? 1 : (max - min) / numBins;
    dataCopy.forEach(item => {
        let binIndex = Math.floor((item - min) / binSize);
        // for values that lie exactly on last bin we need to subtract one
        if (binIndex === numBins) {
            binIndex--;
        }
        bins[binIndex][1]++;
    });

    return bins;
}

export default {histogram};