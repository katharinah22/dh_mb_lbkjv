MovieBarcodes.ResultListItem = function() {
	var that = {}, 
	id = null, 
	title = null, 
	year = null, 
	director = null, 
	genre = null, 
	country = null, 
	domCol1Value = null, 
    domCol1Percentage = null, 
    domCol1Name = null,
    domCol2Value = null, 
    domCol2Percentage = null, 
    domCol2Name = null,
    domCol3Value = null, 
    domCol3Percentage = null, 
    domCol3Name = null,

	init = function(options) {
		id = options.id; 
		title = options.title;
		year = options.year;
		director = options.director;
		genre = options.genre;
		country = options.country;
		domCol1Value = options.domCol1Value; 
	    domCol1Percentage = options.domCol1Percentage;
	    domCol1Name = options.domCol1Name;
	    domCol2Value = options.domCol2Value; 
	    domCol2Percentage = options.domCol2Percentage;
	    domCol2Name = options.domCol2Name;
	    domCol3Value = options.domCol3Value; 
	    domCol3Percentage = options.domCol3Percentage;
	    domCol3Name = options.domCol3Name;

		template = $('#resultListItem-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
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
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};