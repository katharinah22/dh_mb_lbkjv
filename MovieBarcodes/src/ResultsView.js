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
			var poster = movies[i].poster; 
			var firstColor = movies[i].firstColor; 
			var secondColor = movies[i].secondColor; 
			var thirdColor = movies[i].thirdColor; 
			addResultItem(id, title, poster, firstColor, secondColor, thirdColor); 
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
			poster: options.poster,
			firstColor: options.firstColor, 
			secondColor: options.secondColor, 
			thirdColor: options.thirdColor
		}); 
		var $el = item.render(); 
		$("#results").append($el); 
	}, 

	addResultItem = function(id, title, poster, firstColor, secondColor, thirdColor) {
		makeResultItem({
			id: id, 
			title: title,
			poster: poster,
			firstColor: firstColor, 
			secondColor: secondColor, 
			thirdColor: thirdColor
		});
		var $resultItem = $("#" + id); 
		$resultItem.on('click', {'id': id, 'title': title}, onResultItemClick);
	}; 

	that.addResults = addResults; 
	that.init = init; 
	return that; 
})();