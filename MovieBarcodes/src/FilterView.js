MovieBarcodes.FilterView = (function() {
	var that = {}, 
	
	init = function() {
		//$("#titleInput").
		$("#slider-range").slider({
		    range: true,
		    min: 1920,
		    max: 2016,
		    step: 1,
		    values: [1920, 2016],
		    slide: function (e, ui) {
		    	var startValue = ui.values[0]; 
		    	var endValue = ui.values[1];
		        $('#sliderValue').html(startValue + ' - ' + endValue);
		        /*var parameter = {parameters: [{key: "year", value: {'gte': '2006', 'lte': '2011'}}]}; 
    			$(that).trigger('loadNewResults', [parameter]); */
		    }, 
		    change: function (e, ui) {
		    	var startValue = ui.values[0]; 
		    	var endValue = ui.values[1];
		    	var parameter = {parameters: [{key: "year", value: {'gte': '2006', 'lte': '2011'}}]}; 
    			$(that).trigger('loadNewResults', [parameter]); 
		    }
		});
		$("#filterInputFields input").keyup(onSubmitFilter); 
		$("#genreSelect").on('change', onGenreSelectChange); 
		//$("#actorInput").keyup(onActor); 
		return that; 
	}, 

	onSubmitFilter = function(event) {
		if(event.keyCode == 13) {
			var id = event.currentTarget.id; 
			var key = ""; 
			if (id == "titleInput") {
				key = "title"; 
			} else if (id == "directorInput") {
				key = "director"; 
			} else if (id == "actorInput") {
				key = "actors"; 
			}
			var value = event.currentTarget.value; 
			var parameter = {parameters: [{key: key, value: "/" + value + "/i"}]}; 
			//var parameter = {parameters: [{key: "year", value: {'gte': '2006', 'lte': '2011'}}]}; 
    		$(that).trigger('loadNewResults', [parameter]); 
		}
	}, 

	onGenreSelectChange = function(event) {
		var selected = $(this).find("option:selected").val();
		var genre = selected.replace(/ \(.*\)/, "");
		var parameter = {parameters: [{key: "storyline.genre", value: "/" + genre + "/"}]}; 
    	$(that).trigger('loadNewResults', [parameter]); 
	}, 

	loadGenreSelect = function(genres) {
		$.each(genres, function(key, value) {
			$("#genreSelect").append("<option>" + key + " (" + value + ")" + "</option>"); 
		}); 
		$("#genreSelect").selectpicker('refresh');
	}; 

	that.loadGenreSelect = loadGenreSelect; 
	that.init = init; 
	return that; 
})();