MovieBarcodes.FilterView = (function() {
	var that = {}, 
	filterItemNr, 
	parameters,
	sort, 
	
	init = function() {
		//$("#titleInput").
		filterItemNr = 0; 
		parameters = [];
		sort = {value: "title", sortDirection: "1"}; 
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
		    	var parameter = {parameters: parameters, sort: sort}; 
    			$(that).trigger('loadNewResults', [parameter]); 
    			addFilterItem("year", (startValue + " - " + endValue)); 
		    }
		});
		$("#filterInputFields input").keyup(onSubmitFilter); 
		$("#genreSelect").on('change', onGenreSelectChange); 
		$("#sortedBySelect").on('change', onSotrBySelectChange); 
		$(".colorSelectItem").on('click', onSelectColor); 
		$("#sortDirectionToggle").on('click', onSortDirecionToggleClick); 
		$("#resetFiltersButton").on('click', onResetFilterButtonClick); 
		$("#showResultListButton").on('click', onShowResultListButtonClick); 
		$("#showResultModuleButton").on('click', onShowResultModuleButtonClick); 

		return that; 
	}, 

	onShowResultListButtonClick = function(event) {
		$(that).trigger('showResultList');
	}, 

	onShowResultModuleButtonClick = function(event) {
		adaptResults(); 
	},

	onSelectColor = function(event) {
		var color = "" + $(event.currentTarget).attr("data-id");
		console.log(color); 
		parameters.push({key: "dominantColors.1.clusteredcolor", value: color}); 
		var parameter = {parameters: parameters, sort: sort}; 
		addColorFilterItem("color", color); 
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
			adaptResults();  
    		addFilterItem(key, value); 
		}
	}, 

	onResetFilterButtonClick = function(event) {
		parameters = []; 
		$(".filter").each(function() {
			$(this).remove(); 
		});
		adaptResults(); 
	}, 

	adaptResults = function() {
		var p = (parameters.length == 0) ? "" : parameters; 
		var parameter = {parameters: p, sort: sort}; 
    	$(that).trigger('loadNewResults', [parameter]);
	}, 

	onSotrBySelectChange = function(event) {
		var selected = $(this).find("option:selected").val();
		var value = (selected == "genre") ? "storyline.genre" : selected;
		sort["value"] = value; 
		adaptResults(); 
	}, 

	onGenreSelectChange = function(event) {
		var selected = $(this).find("option:selected").val();
		var genre = selected.replace(/ \(.*\)/, "");
		removeFilter("storyline.genre"); 
		removeFilterItemByType("genre"); 
		parameters.push({key: "storyline.genre", value: "/" + genre + "/"}); 
		adaptResults(); 
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
		sort["sortDirection"] = sortDirection; 
		//sort = {value: "title", sortDirection: sortDirection}; 
		adaptResults(); 
	}, 

	removeFilter = function(filterType) {
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i]["key"] == filterType) {
				parameters.splice(i, 1); 
			}
		}
	}, 

	onRemoveFilterItemClick = function(event) {
		var $filter = $(event.currentTarget).closest(".filter"); 
		var filterType = $filter.find(".filterType").text();
		if(filterType == "genre") {
			filterType = "storyline.genre";
		} if(filterType == "color") {
			filterType = "dominantColors.1.clusteredcolor";
		} 
		//filterType = (filterType == "genre") ? "storyline.genre" : filterType; 
		$filter.remove();
		removeFilter(filterType); 
		adaptResults(); 
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
	}, 

	makeColorFilterItem = function(options) {
		var item = MovieBarcodes.ColorFilterItem().init({
			id: options.id,
			filterType: options.filterType, 
			color: options.color
		}); 
		var $el = item.render(); 
		$("#selectedFilters").append($el); 
	}, 

	addColorFilterItem = function(filterType, color) {
		makeColorFilterItem({
			id: filterItemNr, 
			filterType: filterType, 
			color: color
		});
		var $filterItem = $("#" + filterItemNr); 
		$filterItem.on('click', ".closeButton", onRemoveFilterItemClick);
		filterItemNr++;
	}; 

	that.loadGenreSelect = loadGenreSelect; 
	that.init = init; 
	return that; 
})();