MovieBarcodes.MainModel = (function() {
	var that = {},

	init = function() {
		var data = {parameters: "", sort: {value: "title", sortDirection: "1"}}; 
		getAllMovies(data); 
		/*var data = {parameters: [{key: "year", value: "2004"}]}; 
		getAllMovies(data); */
		
		return that; 
	},  

	sortResults = function(value, sortDirection) {
		$.ajax({url: "src/php/getMovies.php?command=sortResults", data: {value: value, sortDirection: sortDirection}}).done(function(data) {
			var movies = jQuery.parseJSON(data);
			//var movies = object.movies; 
			$(that).trigger('loadResults', [movies]); 
		});
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
	that.sortResults = sortResults; 
	return that; 
})(); 
