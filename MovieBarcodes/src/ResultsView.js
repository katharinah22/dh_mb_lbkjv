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
			if (poster == "") {
				var image = "res/images/noPosterAvailable.png"; 
			} else {
				var image = poster;
			}
			addResultItem(id, title, year, genre, image, firstColor, secondColor, thirdColor); 
		}
	}, 

	loadResultListItems = function(movies) {
		console.log(movies); 
		for (var i = 0; i < movies.length; i++) {
			var id = movies[i].id;
			var title = movies[i].title; 
			var year = movies[i].year;
			var director = movies[i].director;
			var genre = movies[i].genre;
			var country = movies[i].country; 
			var dominantColors = movies[i].dominantColors; 

			var domCol1 = dominantColors['1'];
			var domCol2 = dominantColors['2'];
			var domCol3 = dominantColors['3'];

			var domCol1Value = domCol1['realcolor'];
			var domCol1Percentage = domCol1['percent'];
			var domCol1Name = domCol1['clusteredcolor'];

			var domCol2Value = domCol2['realcolor'];
			var domCol2Percentage = domCol2['percent'];
			var domCol2Name = domCol2['clusteredcolor'];

			var domCol3Value = domCol3['realcolor'];
			var domCol3Percentage = domCol3['percent'];
			var domCol3Name = domCol3['clusteredcolor'];
			addResultListItem(id, title, year, director, genre, country, domCol1Value, domCol1Percentage, domCol1Name, domCol2Value, domCol2Percentage, domCol2Name, domCol3Value, domCol3Percentage, domCol3Name); 
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
		if (poster == "res/images/noPosterAvailable.png") {
			$resultItem.find("img").addClass("noImageAvailable");
		}
	}, 

	makeDetailInformationItem = function(options) {
		var item = MovieBarcodes.DetailInformationItem().init({
			id: options.id,
			title: options.title,
			movieBarcode: options.movieBarcode,
			year: options.year, 
			genre: options.genre, 
			director: options.director,
			country: options.country,
			language: options.language,
			runtime: options.runtime,
			cast: options.cast,
			summary: options.summary, 
			mostFrequentWords: options.mostFrequentWords, 
			domCol1Value: options.domCol1Value,
		    domCol1Percentage: options.domCol1Percentage,
		    domCol1Name: options.domCol1Name,
		    domCol2Value: options.domCol2Value,
		    domCol2Percentage: options.domCol2Percentage,
		    domCol2Name: options.domCol2Name,
		    domCol3Value: options.domCol3Value,
		    domCol3Percentage: options.domCol3Percentage,
		    domCol3Name: options.domCol3Name
		}); 
		var $el = item.render(); 
		$("#detailInformationContainer").empty().append($el); 
	}, 

	addDetailInformationItem = function(id, title, movieBarcode, year, genre, director, country, language, runtime, cast, summary, mostFrequentWords, domCol1Value, domCol1Percentage, domCol1Name, domCol2Value, domCol2Percentage, domCol2Name, domCol3Value, domCol3Percentage, domCol3Name) {
		makeDetailInformationItem({
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
			mostFrequentWords: mostFrequentWords,
			domCol1Value: domCol1Value,
		    domCol1Percentage: domCol1Percentage,
		    domCol1Name: domCol1Name,
		    domCol2Value: domCol2Value,
		    domCol2Percentage: domCol2Percentage,
		    domCol2Name: domCol2Name,
		    domCol3Value: domCol3Value,
		    domCol3Percentage: domCol3Percentage,
		    domCol3Name: domCol3Name
		});
		$("#detailInformationModal").modal('show'); 
	}, 

	showMovieDetails = function(movieDetails) {
		var id = "detailInformation";
		var mostFrequentWords = "<p>Liebe (10)</p><p>Freude (4)</p>"; 
		var dominantColors = movieDetails.dominantColors;

		var domCol1 = dominantColors['1'];
		var domCol2 = dominantColors['2'];
		var domCol3 = dominantColors['3'];

		var domCol1Value = domCol1['realcolor'];
		var domCol1Percentage = domCol1['percent'];
		var domCol1Name = domCol1['clusteredcolor'];

		var domCol2Value = domCol2['realcolor'];
		var domCol2Percentage = domCol2['percent'];
		var domCol2Name = domCol2['clusteredcolor'];

		var domCol3Value = domCol3['realcolor'];
		var domCol3Percentage = domCol3['percent'];
		var domCol3Name = domCol3['clusteredcolor'];

		addDetailInformationItem(id, movieDetails.title, movieDetails.image, movieDetails.year, movieDetails.genre, movieDetails.director, movieDetails.country, movieDetails.language, movieDetails.runtime, movieDetails.actors, movieDetails.summary, mostFrequentWords, domCol1Value, domCol1Percentage, domCol1Name, domCol2Value, domCol2Percentage, domCol2Name, domCol3Value, domCol3Percentage, domCol3Name)
	}, 

	makeResultList = function(options) {
		var item = MovieBarcodes.ResultList().init({
			id: options.id
		}); 
		var $el = item.render(); 
		$("#results").empty().append($el);
	}, 

	addResultList = function() {
		makeResultList({
			id: "resultList"
		});
		$(that).trigger('getMoviesForListView'); 
	}, 

	makeResultListItem = function(options) {
		var item = MovieBarcodes.ResultListItem().init({
			id: options.id,
			title: options.title,
			year: options.year, 
			director: options.director,
			genre: options.genre, 
			country: options.country,
			domCol1Value: options.domCol1Value,
		    domCol1Percentage: options.domCol1Percentage,
		    domCol1Name: options.domCol1Name,
		    domCol2Value: options.domCol2Value,
		    domCol2Percentage: options.domCol2Percentage,
		    domCol2Name: options.domCol2Name,
		    domCol3Value: options.domCol3Value,
		    domCol3Percentage: options.domCol3Percentage,
		    domCol3Name: options.domCol3Name
		}); 
		var $el = item.render(); 
		$("#resultListItemContainer").append($el); 
	}, 

	addResultListItem = function(id, title, year, director, genre, country, domCol1Value, domCol1Percentage, domCol1Name, domCol2Value, domCol2Percentage, domCol2Name, domCol3Value, domCol3Percentage, domCol3Name) {
		makeResultListItem({
			id: id, 
			title: title,
			year: year,
			director: director,
			genre: genre, 
			country: country,
			domCol1Value: domCol1Value,
		    domCol1Percentage: domCol1Percentage,
		    domCol1Name: domCol1Name,
		    domCol2Value: domCol2Value,
		    domCol2Percentage: domCol2Percentage,
		    domCol2Name: domCol2Name,
		    domCol3Value: domCol3Value,
		    domCol3Percentage: domCol3Percentage,
		    domCol3Name: domCol3Name
		});
	}; 

	that.addResults = addResults; 
	that.showMovieDetails = showMovieDetails;
	that.addResultList = addResultList;  
	that.loadResultListItems = loadResultListItems; 
	that.init = init; 
	return that; 
})();