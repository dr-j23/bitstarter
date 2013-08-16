#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "htt://google.com";

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.",instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(url){
    return cheerio.load(url);
};

var loadChecks=function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkUrl = function(url, checksfile){
    rest.get(url).on('complete',function(urlHtml){
	console.log(url);
	console.log(urlHtml);
	$ = cheerioUrl(urlHtml);
	console.log('CHECKSFILE: '+checksfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var ii in checks)
	{
	var present = ($(checks[ii]).length > 0);
	out[checks[ii]] = present;
	}
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
    });
};

var clone = function(fn){
    //workaround for commander.js issue
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main==module){
    program
	.option('-c,--checks <checks.json>','Path to checks.json',clone(assertFileExists),CHECKSFILE_DEFAULT)
	.option('-f,--file <index.html>','Path to index.html',clone(assertFileExists),HTMLFILE_DEFAULT)
	.option('-u,--url <url>','URL',false,URL_DEFAULT)
	.parse(process.argv);
    //   console.log(program);
    if (program.rawArgs.indexOf('--file') > -1) {
	var checkJson = checkHtmlFile(program.file,program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }else{
	checkUrl(program.url,program.checks);
    }
} else{
    exports.checkHtmlFile = checkHtmlFile;
}
