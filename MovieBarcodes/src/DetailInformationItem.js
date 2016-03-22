MovieBarcodes.DetailInformationItem = function() {
	var that = {}, 
	id = null, 
	title = null, 
	movieBarcode = null, 
	year = null, 
	genre = null, 
	director = null, 
	country = null,
	language = null,
	runtime = null,
	cast = null,
	summary = null,
	mostFrequentWords = null, 
	template = null, 

	init = function(options) {
		id = options.id; 
		title = options.title;
		movieBarcode = options.movieBarcode;
		year = options.year;
		genre = options.genre; 
		director = options.director;
		country = options.country;
		language = options.language;
		runtime = options.runtime;
		cast = options.cast;
		summary = options.summary;
		mostFrequentWords = options.mostFrequentWords;

		template = $('#detailInformation-tpl').html();
		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id, 
			title: title,
			movieBarcode: movieBarcode, 
			year: year,
			genre: genre, 
			director: director,
			country: country,
			language: language,
			runtime: runtime,
			cast: cast,
			summary: summary, 
			mostFrequentWords: mostFrequentWords
		});
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};