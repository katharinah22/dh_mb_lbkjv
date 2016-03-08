MovieBarcodes.FilterItem = function() {
	var that = {}, 
	id = null, 
	filterType = null, 
	filterName = null, 
	template = null, 

	init = function(options) {
		id = options.id; 
		filterType = options.filterType;
		filterName = options.filterName;

		template = $('#filterItem-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id, 
			filterType: filterType, 
			filterName: filterName
		});
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};