"use strict";

var express = require('express');
var app = express();
var validUrl = require('valid-url');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://piet:snot1@ds051615.mongolab.com:51615/shorten-your-url');
var Schema = mongoose.Schema;

var shortUrlSchema = new Schema({
    urlNumber: {type: Number},
    originalUrl: {type: String}
});

var shortUrlModel= mongoose.model('urlshort', shortUrlSchema);



function checkURL(req, res){
	var url = (req.originalUrl).slice(5);
	var response;
	var newUrlCount;
	var herokuAppUrl = 'http://shorten-your-url.herokuapp.com/'
	console.log('url: ', url)
	if (validUrl.isUri(url)){
		shortUrlModel.find({originalUrl: url}, function(err,obj){
			if (obj[0]){
				response = JSON.stringify({"original_url": url, short_url: herokuAppUrl + obj[0].urlNumber});   
				res.setHeader('Content-Type', 'text/html');
				res.send('<p>' + response + '</p>');
			} else {	
				console.log('url not found')	;
				shortUrlModel.count({}, function (err, count) {
					newUrlCount = count + 1;
					response = JSON.stringify({"original_url": url, short_url: herokuAppUrl + newUrlCount});   
					res.setHeader('Content-Type', 'text/html');
					res.send('<p>' + response + '</p>');
					storeShortUrl(url, newUrlCount);					
		        })
		      }		      
		})
	}
	 else {
		res.setHeader('Content-Type', 'text/html');
		res.send('<p>' + url + ' looks like an invalid URI</p>');	
	}
}



function storeShortUrl(url, newUrlCount){
	shortUrlModel.create({
						urlNumber: newUrlCount,
						originalUrl: url
						}, function(err, urlObj){
							  if(!err){
							  	console.log(urlObj);
							  }
					       }
					   );
}

function shortUrl(req, res){
	var id = req.params.id;
	var obj;
    
	shortUrlModel.find({urlNumber: id}, function(err, storedUrl){
		if (storedUrl[0] !== undefined) {
			obj = storedUrl[0];
			console.log(obj.originalUrl)
			res.redirect(obj.originalUrl);
		}
		else {
			res.setHeader('Content-Type', 'text/html');
			res.send('<p>url not found</p>');
		}
	});
}

app.get('/new/*', checkURL);

app.get('/:id', shortUrl);

app.listen(port);




