var trianglify    = require('trianglify'),
	fs            = require('fs'),
	xmlserializer = require('xmlserializer');

var svg = trianglify({
	width: 1600,
	height: 900,
	cell_size: 50,
	variance: 1,
	seed: new Date().getTime(),
	x_colors: 'random',
	y_colors: 'random'
}).svg();

var svgString = xmlserializer.serializeToString(svg);

fs.writeFileSync('../img/background.svg', svgString);
