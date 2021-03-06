MovieBarcodes.FilterView = (function() {
	var that = {}, 
	filterItemNr, 
	parameters,
	sort, 
	yearSlider, 
	
	init = function() {
		//$("#titleInput").
		filterItemNr = 0; 
		parameters = [];
		sort = {value: "title", sortDirection: "1"}; 
		yearSlider = $("#slider-range");
		yearSlider.slider({
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
		    	$("#resetFiltersButton").show();
		    	var parameter = {parameters: parameters, sort: sort}; 
    			if($("#results").attr("data-id") == "module") {
					$(that).trigger('loadNewResults', [parameter]); 
				} else {
					$(that).trigger('getMoviesForListView', parameter); 
				}
    			addFilterItem("year", (startValue + " - " + endValue)); 
		    }
		});
		$("#filterInputFields input").keyup(onSubmitFilter); 
		$("#search input").keyup(onSubmitFilter); 
		$("#genreSelect").on('change', onGenreSelectChange); 
		$("#sortedBySelect").on('change', onSortedBySelectChange); 
		$(".colorSelectItem").on('click', onSelectColor); 
		$("#sortDirectionToggle").on('click', onSortDirecionToggleClick); 
		$("#resetFiltersButton").on('click', onResetFilterButtonClick); 
		$("#showResultListButton").on('click', onShowResultListButtonClick); 
		$("#showResultModuleButton").on('click', onShowResultModuleButtonClick); 
		$("#searchForWordOccurrenceButton").on('click', onSearchForWordOccurrenceButtonClick); 


		return that; 
	}, 

	onSearchForWordOccurrenceButtonClick = function(event) {
		var searchTerm = $("#search input").val();
		var key = "subtitles";
		removeFilter(key); 
		removeFilterItemByType(key); 
		parameters.push({key: key, value: "/" + searchTerm + "/i"});
		$("#resetFiltersButton").show();
		adaptResults();  
    	addFilterItem(key, searchTerm); 
	}, 

	onShowResultListButtonClick = function(event) {
		var p = (parameters.length == 0) ? "" : parameters; 
		var parameter = {parameters: p, sort: sort}; 
		$("#resultView .alphabeticButtonGroup").hide(); 
		$(that).trigger('showResultList', [parameter]);
	}, 

	onShowResultModuleButtonClick = function(event) {
		var p = (parameters.length == 0) ? "" : parameters; 
		var parameter = {parameters: p, sort: sort}; 
		$("#resultView .alphabeticButtonGroup").show(); 
		$(that).trigger('loadNewResults', [parameter]); 
	},

	onSelectColor = function(event) {
		var color = "" + $(event.currentTarget).attr("data-id");
		parameters.push({key: "color", value: {'name': color, 'gte': 50}}); 
		$("#resetFiltersButton").show();
		console.log(parameters); 
		var parameter = {parameters: parameters, sort: sort}; 
		addColorFilterItem("color", color); 
		if($("#results").attr("data-id") == "module") {
			$(that).trigger('loadNewResults', [parameter]); 
		} else {
			$(that).trigger('getMoviesForListView', parameter); 
		}
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
			} else if (id == "subtitleInput") {
				key = "subtitles";
			}
			var value = event.currentTarget.value; 
			removeFilter(key); 
			removeFilterItemByType(key); 
			parameters.push({key: key, value: "/" + value + "/i"}); 
			$("#resetFiltersButton").show();
			adaptResults();  
    		addFilterItem(key, value); 
		}
	}, 

	onResetFilterButtonClick = function(event) {
		parameters = []; 
		resetTitleInput();
		resetGenreSelect(); 
		resetDirectorInput();
		resetCastInput();
		resetYearSelect();
		
		$("#resultsCount").text("no filters selected");
		$("#resetFiltersButton").hide();
		$(".filter").each(function() {
			$(this).remove(); 
		});

		adaptResults(); 
	}, 

	resetGenreSelect = function() {
		var firstValue = $("#genreSelect option:first").val();
		$("#genreSelect").val(firstValue);
		$("#genreSelect").selectpicker('refresh');
	}, 

	resetTitleInput = function() {
		$("#titleInput").val("");
	}, 

	resetDirectorInput = function() {
		$("#directorInput").val("");
	}, 

	resetCastInput = function() {
		$("#actorInput").val("");
	}, 

	resetYearSelect = function() {
		//$("#slider-range").slider('value', [1920, 2016]);
		yearSlider.slider('values', 0, 1920);
		yearSlider.slider('values', 1, 2016);
	}, 

	adaptResults = function() {
		var p = (parameters.length == 0) ? "" : parameters; 
		var parameter = {parameters: p, sort: sort}; 
    	if($("#results").attr("data-id") == "module") {
			$(that).trigger('loadNewResults', [parameter]); 
		} else {
			$(that).trigger('getMoviesForListView', parameter); 
		}
	}, 

	onSortedBySelectChange = function(event) {
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
		$("#resetFiltersButton").show();
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
		adaptResults(); 
	}, 

	removeFilter = function(filterType) {
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i]["key"] == filterType) {
				parameters.splice(i, 1); 
			}
		}
	}, 

	removeColorFilter = function(filterType, color) {
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i]["key"] == filterType && parameters[i]["value"]["name"] == color) {
				parameters.splice(i, 1); 
			}
		}
	}, 

	onRemoveFilterItemClick = function(event) {
		var $filter = $(event.currentTarget).closest(".filter"); 
		var filterType = $filter.find(".filterType").text();
		if(filterType == "genre") {
			filterType = "storyline.genre";
		} 
		$filter.remove();
		if(filterType == "color") {
			var color = $filter.find(".colorFilterColor").css("background-color");
			removeColorFilter(filterType, color); 
		} else {
			removeFilter(filterType); 
		}
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
		$filterItem.find(".colorPercentageSlider").slider({
		    range: false,
		    min: 0,
		    max: 100,
		    step: 1,
		    value: 50,
		    slide: function (e, ui) {
		        $filterItem.find(".colorPercentageValue").html(">" + ui.value + "%");
		    }, 
		    change: function (e, ui) {
		    	for (var i = 0; i < parameters.length; i++) {
		    		var parameter = parameters[i];
		    		if(parameter['key'] == "color" && parameter['value']['name'] == color) {
		    			parameter['value']['gte'] = ui.value;
		    		}
		    	}
		    	var parameter = {parameters: parameters, sort: sort}; 
		    	if($("#results").attr("data-id") == "module") {
					$(that).trigger('loadNewResults', [parameter]); 
				} else {
					$(that).trigger('getMoviesForListView', parameter); 
				}
		    }
		});
		filterItemNr++;
	}; 

	that.loadGenreSelect = loadGenreSelect; 
	that.init = init; 
	return that; 
})();