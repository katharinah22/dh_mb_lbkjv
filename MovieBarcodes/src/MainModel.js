MovieBarcodes.MainModel = (function() {
	var that = {},

	init = function() {
		var title = "Harry Potter and the Chamber of Secrets"; 
		getMovieData(title); 
		return that; 
	}, 

	getMovieData = function(title) {
		var omdbApi = "http://www.omdbapi.com/?t=" + title;
		$.getJSON(omdbApi).done(function(data) {
		  	console.log(data); 

		  	var poster = data.Poster; 
		  	var title = data.Title; 
		  	var actors = data.Actors; 
		  	var country = data.Country; 
		  	var director = data.Director; 
		  	var genre = data.Genre; 
		  	var language = data.Language; 
		  	var year = data.Year; 
		  	var runtime = data.Runtime; 


		  	$(that).trigger("loadMovieData", [poster, title, actors, country, director, genre, language, year, runtime]); 
		});
	}; 


	that.init = init; 
	return that; 
})(); 
