var diff = require('/usr/local/lib/node_modules/color-diff');
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
var colorCounts = [];
for (var i = 0; i < colorNames.length; i++) {
    colorCounts[colorNames[i]] = 0;
}
var colorCountsString = ""; 
var fs = require('fs'),
    PNG = require('pngjs').PNG;

fs.createReadStream('myMovieBarcode.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {
        var totalPixelCount = this.height * this.width; 
        var count = 0; 
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var idx = (this.width * y + x) << 2;
                var R = this.data[idx];
                var G = this.data[idx+1];
                var B = this.data[idx+2];
                var color = { R: R, G: G, B: B };

                var closest = diff.closest(color, palette);

                for (var i = 0; i < palette.length; i++) {
                    if(JSON.stringify(closest) == JSON.stringify(palette[i])) {
                        var colorName = colorNames[i];
                        //var newColorCount = (colorCounts[colorName] != undefined) ? (colorCounts[colorName] + 1) : 0;
                        var newColorCount = (colorCounts[colorName] + 1);
                        colorCounts[colorName] = newColorCount;
                    }
                }
            }
        }
        var i = 0; 
        var length = Object.keys(colorCounts).length;
        for (var key in colorCounts) {
            var value = (colorCounts[key] / totalPixelCount * 100).toFixed(2);
            colorCountsString += (key + ": " + value);
            if(i != length-1) colorCountsString += ", "; 
            i++;
        }
        console.log(colorCountsString);  
    });