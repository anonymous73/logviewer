/*
Created on Wed Jan 24 12:26:24 2018

@author: Balavivek Sivanantham
*/
var express = require('express')
var app = express()
const expressNunjucks = require('express-nunjucks')
var fs = require('fs')

// config lines
var contents = fs.readFileSync('logs/rosout.log', 'utf8');
app.set('views', __dirname + '/templates')
const njk = expressNunjucks(app, {
    watch: true,
    noCache: true
});


// parsing function
function parse(cnt) {
    var lines = cnt.split('\n')
    var data = []
    lines.forEach(function(value) {
        data.push(gexify(value));
    });
    return data
}
function gexify(s) {
    var time = s.match(new RegExp('([0-9]+\.[0-9]+)'))
    var stat = s.match(new RegExp('( [A-Z]+ )'))
    var prop = s.match(new RegExp('(\[.+\])'))
    var desc = s.match(new RegExp('(\] .+)'))
    console.log(prop)
    var gex = []
    if (time)
        gex.push(time[1])
    if (stat)
        gex.push(stat[1])
    if (prop)
        gex.push(prop[1])
    if (desc)
        gex.push(desc[1])
    return gex
}

// serving route
app.get('/', function (req, res) {
  res.render('index', { 'data' : parse(contents) })
});

// serving route for angular use 
app.get('/file/:name', function (req, res, next) {
    var options = {
      root: __dirname + '/logs/',
      dotfiles: 'allow',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    };
    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
      if (err) {
        next(err);
      } else {
        console.log('Sent:', fileName);
      }
    });
  
});
 
app.listen(3000)
