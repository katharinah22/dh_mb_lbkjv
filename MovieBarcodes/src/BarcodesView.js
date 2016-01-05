MovieBarcodes.BarcodesView = (function() {
	var that = {}, 
	movieItemNr, 
	
	init = function() {
		movieItemNr = 0;
		return that; 
	}, 

	makeMovieItem = function(options) {
		var item = MovieBarcodes.MovieItem().init({
			id: options.id, 
			poster: options.poster,
			title: options.title,
			actors: options.actors,
			country: options.country,
			director: options.director,
			genre: options.genre,
			language: options.language, 
			year: options.year, 
			runtime: options.runtime
		}); 
		var $el = item.render(); 
		$("body").append($el); 
	}, 

	addMovieItem = function(poster, title, actors, country, director, genre, language, year, runtime) {
		makeMovieItem({
			id: "movieItem" + ++movieItemNr, 
			poster: poster,
			title: title,
			actors: actors,
			country: country,
			director: director,
			genre: genre,
			language: language, 
			year: year, 
			runtime: runtime
		});
	}; 

	that.addMovieItem = addMovieItem; 
	that.init = init; 
	return that; 
})();