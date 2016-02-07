var diff = require('/usr/local/lib/node_modules/color-diff');

var R = parseInt(process.argv[2]);
var G = parseInt(process.argv[3]);
var B = parseInt(process.argv[4]);
var color = { R: R, G: G, B: B };
var palette = [ {R: 255, G: 0, B: 0 },  //red
		{R: 255, G: 165, B: 0 }, 		//orange
		{R: 255, G: 255, B: 0 },		//yellow
		{R: 0, G: 128, B: 0 },			//green
		{R: 0, G: 191, B: 255 },		//light blue
		{R: 0, G: 0, B: 255 },			//dark blue
       	{R: 148, G: 0, B: 211 },		//violet
       	{R: 255, G: 182, B: 193 },  	//rose
       	{R: 255, G: 255, B: 255 },		//white
       	{R: 169, G: 169, B: 169 }, 		//grey	
       	{R: 0, G: 0, B: 0 },			//black
       	{R: 139, G: 69, B: 19 } ];		//brown
       	

var colorNames = ["red", "orange", "yellow", "green", "light blue", "dark blue", "violet", "rose", "white", "grey", "black", "brown"];

var closest = diff.closest(color, palette);

for (var i = 0; i < palette.length; i++) {
	if(JSON.stringify(closest) == JSON.stringify(palette[i])) {
		var colorName = colorNames[i];
		console.log(colorName); 
	}
}
//console.log(closest); 
