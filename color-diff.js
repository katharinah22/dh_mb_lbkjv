var diff = require('/usr/local/lib/node_modules/color-diff');
//var diff = require('C:/Users/katharina/node_modules/color-diff');

var R = parseInt(process.argv[2]);
var G = parseInt(process.argv[3]);
var B = parseInt(process.argv[4]);
var color = { R: R, G: G, B: B };
var palette = [ {R: 255, G: 0, B: 0 },          //rot
                {R: 0, G: 255, B: 0 },          //grün
                {R: 0, G: 0, B: 255},           //blau
                {R: 255, G: 255, B: 0 },        //gelb
                {R: 0, G: 255, B: 255 },        //cyan
                {R: 255, G: 0, B: 255},         //magenta
                {R: 255, G: 127, B: 0},         //orange
                {R: 127, G: 51, B: 0},          //braun
                {R: 127, G: 127, B: 127},       //grau
                {R: 255, G: 255, B: 255},       //weiß
                {R: 0, G: 0, B: 0} ];           //schwarz

var colorNames = ["red", "green", "blue", "yellow", "cyan", "magenta", "orange", "brown", "grey", "white", "black"];
var closest = diff.closest(color, palette);

for (var i = 0; i < palette.length; i++) {
	if(JSON.stringify(closest) == JSON.stringify(palette[i])) {
		var colorName = colorNames[i];
		console.log(colorName);
	}
}
//console.log(closest);
