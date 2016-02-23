MovieBarcodes.MainController = (function() {
	var that = {},
	filterView = null, 
	resultsView = null; 
	mainModel = null; 

	init = function() {
		mainModel = MovieBarcodes.MainModel; 
		mainModel.init(); 

		filterView = MovieBarcodes.FilterView.init(); 
		resultsView = MovieBarcodes.ResultsView.init(); 

		$(mainModel).on('loadResultsAndGenres', onLoadResultsAndGenres); 
		$(mainModel).on('loadResults', onLoadResults); 
		$(mainModel).on('loadMovieData', onLoadMovieData); 

		$(resultsView).on('resultItemClick', onResultItemClick); 

		$(filterView).on('loadNewResults', onLoadNewResults); 
		$(filterView).on('changeSorting', onChangeSorting); 
	}, 

	onChangeSorting = function(event, value, sortDirection) {
		mainModel.sortResults(value, sortDirection); 
	}, 

	onLoadNewResults = function(event, parameters) {
		mainModel.getMovies(parameters); 
	}, 

	onResultItemClick = function(event, id, title) {
		mainModel.getMovieDetails(id, title); 
	}, 

	onLoadResultsAndGenres = function(event, movies, genres) {
		resultsView.addResults(movies); 
		filterView.loadGenreSelect(genres); 	
	}, 

	onLoadResults = function(event, movies) {
		resultsView.addResults(movies); 
	}, 

	onLoadMovieData = function(event, poster, title, actors, country, director, genre, language, year, runtime) {
		barcodesView.addMovieItem(poster, title, actors, country, director, genre, language, year, runtime); 
	}; 

	that.init = init; 
	return that; 
})();