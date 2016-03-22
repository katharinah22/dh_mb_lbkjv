MovieBarcodes.ResultsView = (function() {
	var that = {}, 
	
	init = function() {
     
		return that; 
	}, 

	drawChart = function(percentages, colors) { 
		//$("#averageColorsChart").empty();
		console.log(percentages, colors);  
        plot2 = $.jqplot('averageColorsChart', [percentages], {
            seriesDefaults: {
                renderer:$.jqplot.BarRenderer,
                pointLabels: { show: true }, 
                rendererOptions:{ varyBarColor : true }
            },
            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: colors
                }, 
                yaxis: {
                	max: 100, 
                	label:'colors in %',
          			labelRenderer: $.jqplot.CanvasAxisLabelRenderer
                }
            }, 
            seriesColors: colors
        });
        $('#averageColorsChart').unbind("jqplotDataClick");
        $('#averageColorsChart').bind('jqplotDataClick', 
            function (ev, seriesIndex, pointIndex, data) {
            	var color = colors[pointIndex];
            	console.log(color);
                console.log($(".colorSelectItem[data-id='" + color + "']"));
                $(".colorSelectItem[data-id=" + color + "]").trigger( "click" );
            }
  		);
	}, 

	addChart = function(domColPercentageCount) {
		var percentages = [];
		var colors = [];
		$("#averageColorsChart").empty();
		console.log(domColPercentageCount.length); 
		if(domColPercentageCount.length != 0) {
			for (var key in domColPercentageCount) {
				colors.push(key);
				percentages.push(domColPercentageCount[key]);
			}
	     	drawChart(percentages, colors); 
		} 
	},

	setKeywords = function(word_list) {
		$("#tagcloud").empty();
	    $("#tagcloud").jQCloud(word_list, {
	    	autoResize: true
		  //shape: 'rectangular'
		});
	    //$("#tagcloud").on('click', 'span', onTagClick);
	}, 

	addResults = function(movies, domColPercentageCount, overallMostFrequentWords) {
		console.log("ready"); 
		$("#results").empty(); 
		var moviesLength = movies.length;
		for (var i = 0; i < moviesLength; i++) {
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
		$("#resultsCount").text(moviesLength + " results");
		addChart(domColPercentageCount);
		addTagCloud(overallMostFrequentWords); 
		initSections();
	}, 

	addTagCloud = function(overallMostFrequentWords) {
		var words = [];
		console.log(overallMostFrequentWords); 
		for (var key in overallMostFrequentWords) {
			var word = {};
			word['text'] = key;
			word['weight'] = overallMostFrequentWords[key];
			words.push(word); 
		}
		setKeywords(words); 
	}, 

	initSections = function(){
		var sort = $("#sortedBySelect").find("option:selected").val();
		var letters = [];

		if(sort == "year") {
			letters = alphabeticalOverview.countLetters(".resultYear", true, function(txt){
				var year = txt.replace(/[ ()]/g, "");
				if(year<=1850) return "<1850";
				else if(year>1850&&year<=1900)return "1851-1900";
				else {
					var from = Math.floor(year/10)*10;
					var to = ((Math.floor(year/10)+1)*10)-1;
					return from+"-"+to;
				}
			});
		} else {
			letters = alphabeticalOverview.countLetters(".resultTitle", true);
		}
		createAlphabet(letters);
		createSections(letters);
	},

	createAlphabet = function(letters){
		createButtons(letters);
		alphabeticalOverview.addListenerToAlphabet(".alphabetButton.enabled");
	},

	createSections = function(letters) {
		for(var l in letters){
			var section = ("<div class='sections' name='alphabeticalOverview_"+ l +"'>" + l + "</div>  <button class='btn btn-default backToTop'>Back to Top</button>");	
			$("div[name='alphabeticalOverview_"+l+"']").closest(".resultItem").before(section);
		}
		$(".backToTop").on('click', onJumpToTopClick);
		if ($(".backToTop").length) {
			$(".backToTop")[0].remove();
		}
	},

	createButtons = function(letters){
		$(".alphabetButton").remove();
		for(var l in letters){
			var btn = $("<button class='btn btn-default alphabetButton'>"+l+"</button>");
			if(letters[l]>0)btn.addClass("enabled");
			else btn.prop("disabled",true);
			$(".letters").append(btn);
		}
	},

	onJumpToTopClick = function(event) {
		$('html, body').animate({ scrollTop: 0 });
	},

	loadResultListItems = function(movies, domColPercentageCount, overallMostFrequentWords) {
		$("#resultListItemContainer").empty(); 
		console.log(movies); 

		$(".alphabetButton").remove();
		for (var i = 0; i < movies.length; i++) {
			var id = movies[i].id;
			var title = movies[i].title; 
			var year = movies[i].year;
			var director = movies[i].director;
			var genre = movies[i].genre;
			var country = movies[i].country; 
			var dominantColors = movies[i].dominantColors; 

			var domCol1 = dominantColors[0];
			var domCol2 = dominantColors[1];
			var domCol3 = dominantColors[2];

			var domCol1Value = domCol1['color'];
			var domCol1Percentage = domCol1['percent'];
			var domCol1Name = domCol1['color'];

			var domCol2Value = domCol2['color'];
			var domCol2Percentage = domCol2['percent'];
			var domCol2Name = domCol2['color'];

			var domCol3Value = domCol3['color'];
			var domCol3Percentage = domCol3['percent'];
			var domCol3Name = domCol3['color'];

			addResultListItem(id, title, year, director, genre, country, domCol1Value, domCol1Percentage, domCol1Name, domCol2Value, domCol2Percentage, domCol2Name, domCol3Value, domCol3Percentage, domCol3Name); 
		}
		addChart(domColPercentageCount);
		addTagCloud(overallMostFrequentWords); 
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
		$("#results").attr("data-id", "module");
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
			mostFrequentWords: options.mostFrequentWords
		}); 
		var $el = item.render(); 
		$("#detailInformationContainer").empty().append($el); 
	}, 

	addDetailInformationItem = function(id, title, movieBarcode, year, genre, director, country, language, runtime, cast, summary, mostFrequentWords) {
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
			mostFrequentWords: mostFrequentWords
		});
		$("#detailInformationModal").modal('show'); 
	}, 

	showMovieDetails = function(movieDetails) {
		var id = "detailInformation";
		var mostFrequentWords = movieDetails.subtitlesMostFrequentWords;
		var dominantColors = movieDetails.dominantColors;
		addDetailInformationItem(id, movieDetails.title, movieDetails.image, movieDetails.year, movieDetails.genre, movieDetails.director, movieDetails.country, movieDetails.language, movieDetails.runtime, movieDetails.actors, movieDetails.summary, mostFrequentWords);
		
		for (var i = 0; i < dominantColors.length; i++) {
			var domCol = dominantColors[i];
			var percentage = domCol['percent'];
			var color = domCol['color'];
			addDominantColorItem(percentage, color);
		}
	}, 

	makeDominantColorItem = function(options) {
		var item = MovieBarcodes.DominantColorItem().init({
			id: options.id, 
			percentage: options.percentage, 
			color: options.color
		}); 
		var $el = item.render(); 
		$("#dominantColorsTable tbody").append($el);
	}, 

	addDominantColorItem = function(percentage, color) {
		makeDominantColorItem({
			id: "dominantColorItem", 
			percentage: percentage, 
			color: color
		});
	}, 

	makeResultList = function(options) {
		var item = MovieBarcodes.ResultList().init({
			id: options.id
		}); 
		var $el = item.render(); 
		$("#results").empty().append($el);
	}, 

	addResultList = function(parameters) {
		makeResultList({
			id: "resultList"
		});
		$(that).trigger('getMoviesForListView', parameters); 
		$("#results").attr("data-id", "list");
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
		var $resultItem = $("#" + id); 
		$resultItem.on('click', {'id': id, 'title': title}, onResultItemClick);
	}; 

	that.addResults = addResults; 
	that.showMovieDetails = showMovieDetails;
	that.addResultList = addResultList;  
	that.loadResultListItems = loadResultListItems; 
	that.init = init; 
	return that; 
})();