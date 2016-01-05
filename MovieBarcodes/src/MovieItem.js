MovieBarcodes.MovieItem = function() {
	var that = {}, 
	id = null, 
	poster = null, 
	title = null, 
	actors = null, 
	country = null, 
	director = null, 
	genre = null, 
	language = null, 
	year = null, 
	runtime = null,
	template = null, 

	init = function(options) {
		id = options.id; 
		poster = options.poster;
		title = options.title; 
		actors = options.actors;
		country = options.country;
		director = options.director;
		genre = options.genre;
		language = options.language; 
		year = options.year; 
		runtime = options.runtime;

		template = $('#movieItem-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id, 
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
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};