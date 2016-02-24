MovieBarcodes.MainModel = (function() {
	var that = {},
	spinnerOverlay, 
	spinner, 

	init = function() {
		initSpinner(); 
		var data = {parameters: "", sort: {value: "title", sortDirection: "1"}}; 
		getAllMovies(data); 
		/*var data = {parameters: [{key: "year", value: "2004"}]}; 
		getAllMovies(data); */
		return that; 
	},  

	initSpinner = function() {
		var opts = {
		  lines: 13 // The number of lines to draw
			, length: 10 // The length of each line
			, width: 5 // The line thickness
			, radius: 12 // The radius of the inner circle
			, scale: 1 // Scales overall size of the spinner
			, corners: 1 // Corner roundness (0..1)
			, color: '#fff' // #rgb or #rrggbb or array of colors
			, opacity: 0.25 // Opacity of the lines
			, rotate: 0 // The rotation offset
			, direction: 1 // 1: clockwise, -1: counterclockwise
			, speed: 1.3 // Rounds per second
			, trail: 60 // Afterglow percentage
			, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
			, zIndex: 2e9 // The z-index (defaults to 2000000000)
			, className: 'spinner' // The CSS class to assign to the spinner
			, top: '50%' // Top position relative to parent
			, left: '50%' // Left position relative to parent
			, shadow: false // Whether to render a shadow
			, hwaccel: false // Whether to use hardware acceleration
			, position: 'absolute' // Element positioning
		};

		spinnerOverlay = $("#loadingOverlay")[0];
		spinner = new Spinner(opts).spin(spinnerOverlay); 
		spinner.stop(); 
	}, 

	stopSpinner = function() {
		$("#loadingOverlay").hide(); 
	    spinner.stop(); 
	}, 

	startSpinner = function() {
		$("#loadingOverlay").show(); 
		spinner.spin(spinnerOverlay);
	}, 

	sortResults = function(value, sortDirection) {
		$.ajax({url: "src/php/getMovies.php?command=sortResults", data: {value: value, sortDirection: sortDirection}}).done(function(data) {
			var movies = jQuery.parseJSON(data);
			//var movies = object.movies; 
			$(that).trigger('loadResults', [movies]); 
			
		});
	}, 

	getAllMovies = function(data) {
		startSpinner(); 
		$.ajax({url: "src/php/getMovies.php?command=getAllMovies", data: data}).done(function(data) {
			//$(that).trigger('loadResults', [data]); 
			var object = jQuery.parseJSON(data);
			var movies = object.movies; 
			var genres = object.genres; 
			$(that).trigger('loadResultsAndGenres', [movies, genres]); 
			stopSpinner();
		});
	}, 

	getMovies = function(data) {
		startSpinner(); 
		$.ajax({url: "src/php/getMovies.php?command=getMovies", data: data}).done(function(data) {
			var movies = jQuery.parseJSON(data);
			//var movies = object.movies; 
			$(that).trigger('loadResults', [movies]); 
			stopSpinner();
		});
	}, 

	getMovieDetails = function(id, title) {
		$("#detailInformationTitle").text(title); 
		$.ajax({url: "src/php/getMovies.php?command=getMovieDetailsByID", data: {id: id}}).done(function(data) {
			var object = jQuery.parseJSON(data); 
			$("#detailInformationImage").attr("src", object.image);
			$("#detailInformationActors").text(object.actors); 
			$("#detailInformationCountry").text(object.country); 
			$("#detailInformationDirector").text(object.director); 
			$("#detailInformationGenre").text(object.genre); 
			$("#detailInformationLanguage").text(object.language);
			$("#detailInformationYear").text(object.year); 
			$("#detailInformationRuntime").text(object.runtime); 
			$("#detailInformationSummary").text(object.summary); 
		});
		$("#detailInformationModal").modal('show'); 
	}; 


	that.init = init; 
	that.getMovies = getMovies; 
	that.getMovieDetails = getMovieDetails; 
	that.sortResults = sortResults; 
	return that; 
})(); 
