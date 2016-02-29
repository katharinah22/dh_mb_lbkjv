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

	that.countLetters = function(cssSelector, addNames){
		initLetterList();
		$(cssSelector).each(function(){
			var letter = $(this).text()[0].toUpperCase();
			if(!letters[letter]&&letters[letter]!=0){
				letter="#";
			}
			if(letters[letter]==0 && addNames){
				$(this).attr("name", "alphabeticalOverview_"+letter);
			}
			letters[letter]++;
		});
		console.log(letters);
		return letters;
	};

	that.jumpToLetter = function(letter){
		letter = letter.toUpperCase();
		if(letter.charCodeAt(0)<CHARCODE_A
			|| letter.charCodeAt(0)>CHARCODE_Z){
			letter = "#";
		}
		jumpTo("alphabeticalOverview_"+letter);
	}

	that.addListenerToAlphabet = function(cssSelector){
		$(cssSelector).click(function(){
			var letter = $(this).text()[0];
			that.jumpToLetter(letter);
		});
	}

	return that;

}();