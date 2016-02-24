MovieBarcodes.ResultsView = (function() {
	var that = {}, 
	
	init = function() {

		return that; 
	}, 

	addResults = function(movies) {
		console.log("ready"); 
		$("#results").empty(); 
		for (var i = 0; i < movies.length; i++) {
			var id = movies[i].id;
			var title = movies[i].title; 
			var year = movies[i].year;
			var genre = movies[i].genre;
			var poster = movies[i].poster; 
			var firstColor = movies[i].firstColor; 
			var secondColor = movies[i].secondColor; 
			var thirdColor = movies[i].thirdColor; 
			addResultItem(id, title, year, genre, poster, firstColor, secondColor, thirdColor); 
		}
	}, 

	onResultItemClick = function(event) {
		var id = event.data.id; 
		var title = event.data.title; 
		$(that).trigger("resultItemClick", [id, title]); 
	}, 

	makeResultItem = function(options) {
		var item = MovieBarcodes.ResultItem().init({
			id: options.id,
			title: options.title,
			year: options.year, 
			poster: options.poster,
			firstColor: options.firstColor, 
			secondColor: options.secondColor, 
			thirdColor: options.thirdColor
		}); 
		var $el = item.render(); 
		$("#results").append($el); 
	}, 

	addResultItem = function(id, title, year, genre, poster, firstColor, secondColor, thirdColor) {
		makeResultItem({
			id: id, 
			title: title,
			year: year,
			poster: poster,
			firstColor: firstColor, 
			secondColor: secondColor, 
			thirdColor: thirdColor
		});
		var $resultItem = $("#" + id); 
		$resultItem.on('click', {'id': id, 'title': title}, onResultItemClick);
		for (var i = 0; i < genre.length; i++) {
			$resultItem.find(".genreImages").append('<div class="genreImageContainer genre' + genre[i] + '"><div class="genreImg"></div></div>'); 
		}
	}; 

	that.addResults = addResults; 
	that.init = init; 
	return that; 
})();