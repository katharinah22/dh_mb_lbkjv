MovieBarcodes.MainModel = (function() {
	var that = {},

	init = function() {
		getColors(); 
		var data = {parameters: ""}; 
		getAllMovies(data); 
		/*var data = {parameters: [{key: "year", value: "2004"}]}; 
		getAllMovies(data); */
		
		return that; 
	},  

	getColors = function() {
		var diff = require('/usr/local/lib/node_modules/color-diff');
		var color = { R: 255, G: 1, B: 30 };
		var palette = [ {R: 255, G: 0, B: 0 },
                {R: 0, G: 255, B: 0 },
                {R: 0, G: 0, B: 255} ];
        var closestColor = diff.closest(color, palette);
        console.log(closestColor); 
	}, 

	getAllMovies = function(data) {
		$.ajax({url: "src/php/getMovies.php?command=getAllMovies", data: data}).done(function(data) {
			var object = jQuery.parseJSON(data);
			var movies = object.movies; 
			var genres = object.genres; 
			$(that).trigger('loadResultsAndGenres', [movies, genres]); 
		});
	}, 

	getMovies = function(data) {
		$.ajax({url: "src/php/getMovies.php?command=getMovies", data: data}).done(function(data) {
			console.log(data); 
			var movies = jQuery.parseJSON(data);
			//var movies = object.movies; 
			$(that).trigger('loadResults', [movies]); 
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
	return that; 
})(); 
