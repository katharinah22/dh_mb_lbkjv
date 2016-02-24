MovieBarcodes.FilterView = (function() {
	var that = {}, 
	filterItemNr, 
	parameters,
	
	init = function() {
		//$("#titleInput").
		filterItemNr = 0; 
		parameters = [];
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
		    	removeFilter("year"); 
		    	removeFilterItemByType("year"); 
		    	parameters.push({key: "year", value: {'gte': startValue, 'lte': endValue}}); 
		    	var parameter = {parameters: parameters, sort: {value: "title", sortDirection: "1"}}; 
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
		parameters.push({key: "dominantColors.1.clusteredcolor", value: 'black'}); 
		console.log(parameters); 
		var parameter = {parameters: parameters, sort: {value: "title", sortDirection: "1"}}; 
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
			removeFilter(key); 
			removeFilterItemByType(key); 
			parameters.push({key: key, value: "/" + value + "/i"}); 
			console.log(parameters); 
			var parameter = {parameters: parameters, sort: {value: "title", sortDirection: "1"}}; 
			//var parameter = {parameters: parameters, sort: {value: "title", sortDirection: "1"}}; 
			console.log(parameter); 
			//var parameter = {parameters: [{key: "year", value: {'gte': '2006', 'lte': '2011'}}]}; 
    		$(that).trigger('loadNewResults', [parameter]); 
    		addFilterItem(key, value); 
		}
	}, 

	onGenreSelectChange = function(event) {
		var selected = $(this).find("option:selected").val();
		var genre = selected.replace(/ \(.*\)/, "");
		removeFilter("storyline.genre"); 
		removeFilterItemByType("genre"); 
		parameters.push({key: "storyline.genre", value: "/" + genre + "/"}); 
		console.log(parameters); 
		var parameter = {parameters: parameters, sort: {value: "title", sortDirection: "1"}}; 
    	$(that).trigger('loadNewResults', [parameter]); 
    	addFilterItem("genre", genre); 
	}, 

	removeFilterItemByType = function(type) {
		if ($("." + type + "Filter")[0]){ 
			$("." + type + "Filter")[0].remove(); 
		};
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

	removeFilter = function(filterType) {
		console.log(filterType); 
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i]["key"] == "storyline.genre") {
				console.log(parameters[i]);
				parameters.splice(i, 1); 
			}
		}
	}, 

	onRemoveFilterItemClick = function(event) {
		var $filter = $(event.currentTarget).closest(".filter"); 
		var filterType = $filter.find(".filterType").text();
		console.log(filterType); 
		$filter.remove();
		removeFilter(filterType); 
		console.log(parameters); 
		var parameter = {parameters: parameters, sort: {value: "title", sortDirection: "1"}}; 
    	$(that).trigger('loadNewResults', [parameter]); 
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