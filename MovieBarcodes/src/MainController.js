MovieBarcodes.MainController = (function() {
	var that = {},
	barcodesView = null; 
	mainModel = null; 

	init = function() {
		mainModel = MovieBarcodes.MainModel; 
		mainModel.init(); 

		barcodesView = MovieBarcodes.BarcodesView.init();

		$(mainModel).on('loadMovieData', onLoadMovieData); 
	}, 

	onLoadMovieData = function(event, poster, title, actors, country, director, genre, language, year, runtime) {
		barcodesView.addMovieItem(poster, title, actors, country, director, genre, language, year, runtime); 
	}; 

	that.init = init; 
	return that; 
})();