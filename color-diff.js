var diff = require('/usr/local/lib/node_modules/color-diff');
//var diff = require('C:/Users/katharina/node_modules/color-diff');

var R = parseInt(process.argv[2]);
var G = parseInt(process.argv[3]);
var B = parseInt(process.argv[4]);
var color = { R: R, G: G, B: B };
var palette = [ {R: 255, G: 0, B: 0 },          //rot
                {R: 255, G: 160, B: 122 },      //rot
                {R: 250, G: 128, B: 114 },      //rot
                {R: 233, G: 150, B: 122 },      //rot
                {R: 240, G: 128, B: 128 },      //rot
                {R: 205, G: 92, B: 92 },        //rot
                {R: 220, G: 20, B: 60 },        //rot
                {R: 178, G: 34, B: 34 },        //rot
                {R: 139, G: 0, B: 0 },          //rot
                {R: 0, G: 255, B: 0 },          //grün
                {R: 173, G: 255, B: 47 },       //grün
                {R: 127, G: 255, B: 0 },        //grün
                {R: 124, G: 252, B: 0 },        //grün
                {R: 50, G: 205, B: 50 },        //grün
                {R: 152, G: 251, B: 152 },      //grün
                {R: 144, G: 238, B: 144 },      //grün
                {R: 0, G: 250, B: 154 },        //grün
                {R: 0, G: 255, B: 127 },        //grün
                {R: 60, G: 179, B: 113 },       //grün
                {R: 46, G: 139, B: 87 },        //grün
                {R: 34, G: 139, B: 34 },        //grün
                {R: 0, G: 128, B: 0 },          //grün
                {R: 0, G: 100, B: 0 },          //grün
                {R: 154, G: 205, B: 50 },       //grün
                {R: 107, G: 142, B: 35 },       //grün
                {R: 85, G: 107, B: 47 },        //grün
                {R: 102, G: 205, B: 170 },      //grün
                {R: 143, G: 188, B: 143 },      //grün
                {R: 32, G: 178, B: 170 },       //grün
                {R: 0, G: 139, B: 139 },        //grün
                {R: 0, G: 128, B: 128 },        //grün
                {R: 0, G: 0, B: 255},           //blau
                {R: 95, G: 158, B: 160},        //blau
                {R: 70, G: 130, B: 180},        //blau
                {R: 176, G: 196, B: 222},       //blau
                {R: 173, G: 216, B: 230},       //blau 
                {R: 176, G: 224, B: 230},       //blau
                {R: 135, G: 206, B: 250},       //blau
                {R: 135, G: 206, B: 235},       //blau
                {R: 100, G: 149, B: 237},       //blau
                {R: 0, G: 191, B: 255},         //blau
                {R: 30, G: 144, B: 255},        //blau
                {R: 65, G: 105, B: 225},        //blau
                {R: 0, G: 0, B: 205},           //blau
                {R: 0, G: 0, B: 139},           //blau
                {R: 0, G: 0, B: 128},           //blau
                {R: 25, G: 25, B: 112},         //blau                                              
                {R: 255, G: 255, B: 0 },        //gelb
                {R: 255, G: 215, B: 0 },        //gelb
                {R: 255, G: 255, B: 224 },      //gelb
                {R: 255, G: 250, B: 205 },      //gelb
                {R: 250, G: 250, B: 210 },      //gelb
                {R: 255, G: 239, B: 213 },      //gelb
                {R: 255, G: 228, B: 181 },      //gelb
                {R: 255, G: 218, B: 185 },      //gelb
                {R: 238, G: 232, B: 170 },      //gelb
                {R: 240, G: 230, B: 140 },      //gelb
                {R: 189, G: 183, B: 107 },      //gelb
                {R: 0, G: 255, B: 255 },        //cyan
                {R: 224, G: 255, B: 255 },      //cyan
                {R: 175, G: 238, B: 238 },      //cyan
                {R: 127, G: 255, B: 212 },      //cyan
                {R: 64, G: 224, B: 208 },       //cyan
                {R: 72, G: 209, B: 204 },       //cyan
                {R: 0, G: 206, B: 209 },        //cyan
                {R: 255, G: 0, B: 255},         //magenta
                {R: 255, G: 192, B: 203},       //magenta pink
                {R: 255, G: 182, B: 193},       //magenta pink
                {R: 255, G: 105, B: 180},       //magenta pink
                {R: 255, G: 20, B: 147},        //magenta pink
                {R: 219, G: 112, B: 147},       //magenta pink
                {R: 199, G: 21, B: 133},        //magenta pink
                {R: 230, G: 230, B: 250},       //magenta purple
                {R: 216, G: 191, B: 216},       //magenta purple
                {R: 221, G: 160, B: 221},       //magenta purple
                {R: 218, G: 112, B: 214},       //magenta purple
                {R: 238, G: 130, B: 238},       //magenta purple
                {R: 186, G: 85, B: 211},        //magenta purple
                {R: 153, G: 50, B: 204},        //magenta purple
                {R: 148, G: 0, B: 211},         //magenta purple
                {R: 138, G: 43, B: 226},        //magenta purple
                {R: 139, G: 0, B: 139},         //magenta purple
                {R: 128, G: 0, B: 128},         //magenta purple
                {R: 147, G: 112, B: 219},       //magenta purple
                {R: 123, G: 104, B: 238},       //magenta purple
                {R: 106, G: 90, B: 205},        //magenta purple
                {R: 72, G: 61, B: 139},         //magenta purple
                {R: 102, G: 51, B: 153},        //magenta purple
                {R: 75, G: 0, B: 130},          //magenta purple
                {R: 255, G: 127, B: 0},         //orange
                {R: 255, G: 165, B: 0},         //orange
                {R: 255, G: 140, B: 0},         //orange
                {R: 255, G: 127, B: 80},        //orange
                {R: 255, G: 99, B: 71},         //orange
                {R: 255, G: 69, B: 0},          //orange
                {R: 127, G: 51, B: 0},          //braun
                {R: 255, G: 248, B: 220},       //braun
                {R: 255, G: 235, B: 205},       //braun
                {R: 255, G: 228, B: 196},       //braun
                {R: 255, G: 222, B: 173},       //braun
                {R: 245, G: 222, B: 179},       //braun
                {R: 222, G: 184, B: 135},       //braun
                {R: 210, G: 180, B: 140},       //braun
                {R: 188, G: 143, B: 143},       //braun
                {R: 244, G: 164, B: 96},        //braun
                {R: 218, G: 165, B: 32},        //braun
                {R: 184, G: 134, B: 11},        //braun
                {R: 205, G: 133, B: 63},        //braun
                {R: 210, G: 105, B: 30},        //braun
                {R: 128, G: 128, B: 0},         //braun
                {R: 139, G: 69, B: 19},         //braun
                {R: 160, G: 82, B: 45},         //braun
                {R: 165, G: 42, B: 42},         //braun
                {R: 128, G: 0, B: 0},           //braun
                {R: 127, G: 127, B: 127},       //grau
                {R: 220, G: 220, B: 220},       //grau
                {R: 211, G: 211, B: 211},       //grau 
                {R: 192, G: 192, B: 192},       //grau 
                {R: 169, G: 169, B: 169},       //grau  
                {R: 105, G: 105, B: 105},       //grau
                {R: 128, G: 128, B: 128},       //grau 
                {R: 119, G: 136, B: 153},       //grau
                {R: 112, G: 128, B: 144},       //grau
                {R: 47, G: 79, B: 79},          //grau                        
                {R: 255, G: 255, B: 255},       //weiß
                {R: 255, G: 250, B: 250},       //weiß
                {R: 240, G: 255, B: 240},       //weiß
                {R: 245, G: 255, B: 250},       //weiß
                {R: 240, G: 255, B: 255},       //weiß
                {R: 240, G: 248, B: 255},       //weiß
                {R: 248, G: 248, B: 255},       //weiß
                {R: 245, G: 245, B: 245},       //weiß
                {R: 255, G: 245, B: 238},       //weiß
                {R: 245, G: 245, B: 220},       //weiß
                {R: 253, G: 245, B: 230},       //weiß
                {R: 255, G: 250, B: 240},       //weiß
                {R: 255, G: 255, B: 240},       //weiß
                {R: 250, G: 235, B: 215},       //weiß
                {R: 250, G: 240, B: 230},       //weiß
                {R: 255, G: 240, B: 245},       //weiß
                {R: 255, G: 228, B: 225},       //weiß
                {R: 0, G: 0, B: 0} ];           //schwarz

var colorNames = ["red", "red", "red", "red", "red", "red", "red", "red", "red", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "green", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "yellow", "cyan", "cyan", "cyan", "cyan", "cyan", "cyan", "cyan", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "magenta", "orange", "orange", "orange", "orange", "orange", "orange", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "grey", "grey", "grey", "grey", "grey", "grey", "grey", "grey", "grey", "grey", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white", "white","white","white","white","white","white","white", "black"];
var closest = diff.closest(color, palette);

for (var i = 0; i < palette.length; i++) {
	if(JSON.stringify(closest) == JSON.stringify(palette[i])) {
		var colorName = colorNames[i];
		console.log(colorName);
	}
}
