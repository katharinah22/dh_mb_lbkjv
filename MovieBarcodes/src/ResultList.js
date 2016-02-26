MovieBarcodes.ResultList = function() {
	var that = {}, 
	id = null, 
	template = null, 

	init = function(options) {
		id = options.id; 

		template = $('#resultList-tpl').html();

		return that; 
	}, 

	render = function() {
		var tpl = _.template(template, {
			id: id
		});
		return $(tpl); 
	};

	that.init = init; 
	that.render = render; 

	return that; 
};