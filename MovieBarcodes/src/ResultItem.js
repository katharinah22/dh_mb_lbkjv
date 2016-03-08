MovieBarcodes.ResultItem = function() {
	var that = {}, 
	id = null, 
	title = null, 
	year = null, 
	poster = null, 
	firstColor = null, 
	secondColor = null, 
	thirdColor = null,
	template = null, 

	init = function(options) {
		id = options.id; 
		title = options.title;
		year = options.year;
		poster = options.poster;
		firstColor = options.firstColor;
		secondColor = options.secondColor;
		thirdColor = options.thirdColor;

		template = $('#resultItem-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id, 
			title: title,
			year: year,
			poster: poster,
			firstColor: firstColor, 
			secondColor: secondColor, 
			thirdColor: thirdColor
		});
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};