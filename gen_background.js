#!/usr/bin/env node

var trianglify    = require('trianglify'),
	fs            = require('fs'),
	xmlserializer = require('xmlserializer'),
	path          = require('path');

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

fs.writeFileSync(path.join(process.argv[2], 'background.svg'), svgString);

if(process.argv[3]) {
    var date = new Date();
	fs.writeFileSync(path.join(process.argv[3], 'background_' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '.svg'), svgString);
}
