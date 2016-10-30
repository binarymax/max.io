var mic = (function() {

	var context;
	var microphone;
	var filter;
	var analyser;
	var listener;
	var settings;

	var analyze;

	navigator.getUserMedia =navigator.getUserMedia       ||
							navigator.webkitGetUserMedia ||
							navigator.mozGetUserMedia    ||
							navigator.msGetUserMedia;

	var audiocontext = window.AudioContext || window.webkitAudioContext;

	var onStream = function(stream) {
		microphone = context.createMediaStreamSource(stream);
		analyser = context.createAnalyser();
		microphone.connect(analyser);
		requestAnimationFrame(analyze);
	};

	var onError = function(e) {
		console.error('No microphone!');
	};

	var analyzeTimeSingle = function() {
		var data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteTimeDomainData(data);
		for(var i = 0; i < data.length; i++) {
			listener(data[i]-128);
		}
		requestAnimationFrame(analyze);
	};

	var analyzeTimeBatch = function() {
		var data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteTimeDomainData(data);
		listener(data);
		requestAnimationFrame(analyze);
	};

	var analyzeFreqSingle = function() {
		analyser.fftSize=512;
		var data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyDomainData(data);
		for(var i = 0; i < data.length; i++) {
			listener(data[i]);
		}
		requestAnimationFrame(analyze);
	};

	var analyzeFreqBatch = function() {
		analyser.fftSize=512;
		var data = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyDomainData(data);
		listener(data);
		requestAnimationFrame(analyze);
	};

	var listen = function(callback,settings) {
		listener = (typeof callback === 'function') ? callback : null;
		settings = (typeof callback === 'object') ? settings : {type:'time_single'};
		if (listener) {
			context = new audiocontext();
			context.createGain = context.createGainNode;
			context.createDelay = context.createDelayNode;
			context.createScriptProcessor = context.createJavaScriptNode;

			switch (settings.type) {
				case 'time_single': analyze = analyzeTimeSingle; break;
				case 'time_batch':  analyze = analyzeTimeBatch;  break;
				case 'freq_single': analyze = analyzeFreqSingle; break;
				case 'freq_batch':  analyze = analyzeFreqBatch;  break;
				default: analyze = analyzeTimeSingle; break;
			}

			navigator.getUserMedia( {audio: true}, onStream, onError);
		} else {
			throw new Error("Listener callback not defined");
		}
	}

return {listen:listen}

})();