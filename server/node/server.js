// Modules
const express = require('express');
const sprintf = require('sprintf');
const fs = require('fs');
const jsonDB = require('node-json-db');
var bodyParser = require('body-parser')


// Configuration files
const serverConfig = require('./config.js').server;

// Global variables
const db = new jsonDB("tempDB", true, false);
const app = express();

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// TODO: Correct the usage of this middleware
// a middleware function with no mount path. This code is executed for every request to the router
app.use(function (req, res, next) {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
	next();
});

function sendTodos(req, res) {
	try {
		var data = db.getData("/todo");
		data.forEach(function(obj, index) {
			data[index]['ID'] = index;
		}.bind(data));
	    res.send(JSON.stringify(data, null, 3));
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
	}

	return res;
}


// Read all todos
app.get('/select', function(req, res){
	console.log("SELECT REQEUST");
	res = sendTodos(req, res);
});

// Uodate a todo
app.post('/update', function(req, res){
	console.log("UPDATE REQEUST");

	var title = '';
	var ID = 0;
	try {
		title = req.body.title;
		ID = req.body.ID;
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
		return;
	}

	var at = new Date().getTime();
	db.push(sprintf("/todo[%s]", ID), {title: title, at: at});

	res = sendTodos(req, res);
});

// Create a todo
app.post('/create', function(req, res){
	res.set('Access-Control-Allow-Origin', '*');
	var title = '';
	try {
		title = req.body.title;
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
		return;
	}


	try {
		db.push('/todo[]', {title: title, at: new Date().getTime()});
		var data = db.getData('/todo');
		res = sendTodos(req, res);
	} catch (ex) {
		console.log(ex);
		res.send(JSON.stringify({error: true, exception: ex.message}));
	}
});

// Delete a todo
app.post('/delete', function(req, res){
	res.set('Access-Control-Allow-Origin', '*');
	var ID;
	try {
		ID = req.body.ID;
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
		return;
	}

	try {
		db.delete(sprintf("/todo[%s]", ID));
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
		return;
	}	

	res = sendTodos(req, res);
});

app.listen(serverConfig.port, function() {
	console.log(sprintf("listening to port: %d", serverConfig.port));
});