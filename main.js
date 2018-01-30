/*
Created on Wed Jan 24 12:26:24 2018

@author: Balavivek Sivanantham
*/
var express = require('express')
var app = express()
const expressNunjucks = require('express-nunjucks')
var fs = require('fs')

// config lines
var master_contents = fs.readFileSync('logs/master.log', 'utf8')
var rosout_contents = fs.readFileSync('logs/rosout.log', 'utf8')
// uncomment below lines to save files in json format
// fs.writeFileSync('logs/master.json', JSON.stringify(master_parse(master_contents)))
// fs.writeFileSync('logs/rosout.json', JSON.stringify(rosout_parse(rosout_contents)))
app.set('views', __dirname + '/templates')
const njk = expressNunjucks(app, {
    watch: true,
    noCache: true
});


// parsing functions
function master_parse(cnt) {
    var lines = cnt.split('\n')
    var data = []
    lines.forEach(function(value) {
        var tmp = value.split(' ')
        console.log(tmp)
        var entry = {}
        entry['name'] = tmp[0]
        entry['date'] = tmp[1]
        entry['time'] = tmp[2]
        entry['data'] = tmp.slice(3).join(' ')
        data.push(entry)
    });
    return data
}
function rosout_parse(cnt) {
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
    var prop_strt = s.indexOf('[')
    var prop_end = s.lastIndexOf(']')
    var prop = s.substring(prop_strt, prop_end+1)
    var desc = s.match(new RegExp('(\] .+)'))
    var gex = {}
    if (time)
        gex['time'] = time[1]
    if (stat)
        gex['stat'] = stat[1]
    if (prop)
        gex['prop'] = prop
    if (desc)
        gex['desc'] = desc[1].substring(1)
    return gex
}

// serving route
app.get('/rosout/', function (req, res) {
    res.render('rosout', { 'data' : rosout_parse(rosout_contents), 'page': 'rosout' })
  });
  
app.get('/', function (req, res) {
    res.render('master', { 'data' : master_parse(master_contents), 'page': 'master' })
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
