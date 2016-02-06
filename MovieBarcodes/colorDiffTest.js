var diff = require('color-diff');
var color = { R: 255, G: 1, B: 30 };
var palette = [ {R: 255, G: 0, B: 0 },
        {R: 0, G: 255, B: 0 },
        {R: 0, G: 0, B: 255} ];
diff.closest(color, palette);