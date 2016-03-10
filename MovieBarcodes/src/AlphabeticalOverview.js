var alphabeticalOverview = function(){
	
	var that = {};

	var letters = {};

	var CHARCODE_A = 65;
	var CHARCODE_Z = 90;

	if(!$)$=jQuery;

	var initLetterList = function(){
		letters = {
			"#":0
		};
		for(var i=CHARCODE_A; i<=CHARCODE_Z; i++){
			letters[String.fromCharCode(i)] = 0;
		}
	}

	var jumpTo = function(name){
		var target = jQuery("[name="+name+"]");
		var top = target.offset().top;
		$("html, body").animate({ scrollTop: top });
	}

	that.countLetters = function(cssSelector, addNames, formatFunction){
		if(!formatFunction){
			initLetterList();
		}else{
			letters = {};
		}
		$(cssSelector).each(function(){
			if(formatFunction){
				var letter = formatFunction($(this).text());
				if(!letters[letter]){
					letters[letter]=0;
				}
			}else{
				var letter = $(this).text()[0].toUpperCase();
				if(!letters[letter]&&letters[letter]!=0){
					letter="#";
				}
			}
			if(letters[letter]==0 && addNames){
				$(this).attr("name", "alphabeticalOverview_"+letter);
			}
			letters[letter]++;
		});
		return letters;
	};

	that.jumpToLetter = function(letter){
		letter = letter.toUpperCase();
		jumpTo("alphabeticalOverview_"+letter);
	}

	that.addListenerToAlphabet = function(cssSelector){
		$(cssSelector).click(function(){
			var letter = $(this).text();
			that.jumpToLetter(letter);
		});
	}

	return that;

}();