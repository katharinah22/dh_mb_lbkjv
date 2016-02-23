MovieBarcodes.FilterView = (function() {
	var that = {}, 
	filterItemNr, 
	
	init = function() {
		//$("#titleInput").
		filterItemNr = 0; 
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
		    }, 
		    change: function (e, ui) {
		    	var startValue = ui.values[0]; 
		    	var endValue = ui.values[1];
		    	var parameter = {parameters: [{key: "year", value: {'gte': startValue, 'lte': endValue}}], sort: {value: "title", sortDirection: "1"}}; 
    			$(that).trigger('loadNewResults', [parameter]); 
    			addFilterItem("year", (startValue + " - " + endValue)); 
		    }
		});
		$("#filterInputFields input").keyup(onSubmitFilter); 
		$("#genreSelect").on('change', onGenreSelectChange); 
		$(".colorSelectItem").on('click', onSelectColor); 
		$("#sortDirectionToggle").on('click', onSortDirecionToggleClick); 

		return that; 
	}, 

	onSelectColor = function(event) {
		var parameter = {parameters: [{key: "dominantColors.1.clusteredcolor", value: 'black'}], sort: {value: "title", sortDirection: "1"}}; 
    	$(that).trigger('loadNewResults', [parameter]); 
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
			var parameter = {parameters: [{key: key, value: "/" + value + "/i"}], sort: {value: "title", sortDirection: "1"}}; 
			//var parameter = {parameters: [{key: "year", value: {'gte': '2006', 'lte': '2011'}}]}; 
    		$(that).trigger('loadNewResults', [parameter]); 
    		addFilterItem(key, value); 
		}
	}, 

	onGenreSelectChange = function(event) {
		var selected = $(this).find("option:selected").val();
		var genre = selected.replace(/ \(.*\)/, "");
		var parameter = {parameters: [{key: "storyline.genre", value: "/" + genre + "/"}], sort: {value: "title", sortDirection: "1"}}; 
    	$(that).trigger('loadNewResults', [parameter]); 
    	addFilterItem("genre", genre); 
	}, 

	loadGenreSelect = function(genres) {
		$.each(genres, function(key, value) {
			$("#genreSelect").append("<option>" + key + " (" + value + ")" + "</option>"); 
		}); 
		$("#genreSelect").selectpicker('refresh');
	}, 

	onSortDirecionToggleClick = function(event) {
		var toggleButton = $(event.currentTarget); 
		var sortDirection = null; 
		var value = $("#sortedBySelect").val(); 
		console.log(value); 
		toggleButton.empty(); 
		if(toggleButton.hasClass("ascending")) {
			toggleButton.removeClass("ascending").addClass("descending"); 
			toggleButton.append('<span class="zmdi zmdi-long-arrow-down zmdi-hc-lg"></span>'); 
			sortDirection = "-1"; 

		} else {
			toggleButton.removeClass("descending").addClass("ascending"); 
			toggleButton.append('<span class="zmdi zmdi-long-arrow-up zmdi-hc-lg"></span>'); 
			sortDirection = "1"; 
		}
		var parameter = {parameters: "", sort: {value: "title", sortDirection: sortDirection}}; 
    	$(that).trigger('loadNewResults', [parameter]); 
	}, 

	onRemoveFilterItemClick = function(event) {
		$(event.currentTarget).closest(".filter").remove(); 
	}, 

	makeFilterItem = function(options) {
		var item = MovieBarcodes.FilterItem().init({
			id: options.id,
			filterType: options.filterType,
			filterName: options.filterName
		}); 
		var $el = item.render(); 
		$("#selectedFilters").append($el); 
	}, 

	addFilterItem = function(filterType, filterName) {
		makeFilterItem({
			id: filterItemNr, 
			filterType: filterType,
			filterName: filterName
		});
		var $filterItem = $("#" + filterItemNr); 
		$filterItem.on('click', ".closeButton", onRemoveFilterItemClick);
		filterItemNr++;
	}; 

	that.loadGenreSelect = loadGenreSelect; 
	that.init = init; 
	return that; 
})();