MovieBarcodes.DominantColorItem = function() {
	var that = {}, 
	id = null, 
	percentage = null, 
	color = null, 
	template = null, 

	init = function(options) {
		id = options.id; 
		percentage = options.percentage;
		color = options.color;

		template = $('#dominantColorItem-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id, 
			percentage: percentage, 
			color: color
		});
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};