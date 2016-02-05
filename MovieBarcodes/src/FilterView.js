MovieBarcodes.FilterView = (function() {
	var that = {}, 
	
	init = function() {
		
		$("#titleInput").keyup(onSubmitFilter); 
		$("#genreSelect").on('change', onGenreSelectChange); 
		return that; 
	}, 

	onSubmitFilter = function(event) {
		if(event.keyCode == 13) {
			console.log(event.currentTarget.value); 
		}
	}, 

	onGenreSelectChange = function(event) {
		var selected = $(this).find("option:selected").val();
		var genre = selected.replace(/ \(.*\)/, "");
		/*var parameter = {
		  	key: "genre",
		  	value: genre
		};*/
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