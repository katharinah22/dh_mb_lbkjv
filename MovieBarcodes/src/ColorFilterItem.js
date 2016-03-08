MovieBarcodes.ColorFilterItem = function() {
	var that = {}, 
	id = null, 
	filterType = null, 
	color = null, 
	template = null, 

	init = function(options) {
		id = options.id; 
		filterType = options.filterType;
		color = options.color;

		template = $('#colorFilterItem-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id, 
			filterType: filterType, 
			color: color
		});
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};