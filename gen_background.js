var trianglify    = require('trianglify'),
	fs            = require('fs'),
	xmlserializer = require('xmlserializer');

var svg = trianglify({
	width: 1600,
	height: 900,
	cell_size: Math.random() * 100 + 30,
	variance: 1,
	seed: new Date().getTime(),
	x_colors: 'random',
	y_colors: 'random'
}).svg();

var svgString = xmlserializer.serializeToString(svg);

fs.writeFileSync('./www/assets/img/background.svg', svgString);

if(!fs.existsSync('./www/background_archive')) {
	fs.mkdirSync('./www/background_archive');
}

var date = new Date();

fs.writeFileSync('./www/background_archive/background_' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '.svg', svgString);
