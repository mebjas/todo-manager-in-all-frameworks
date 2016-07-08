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
const router = express.Router();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// TODO: Correct the usage of this middleware
// a middleware function with no mount path. This code is executed for every request to the router
router.use(function (req, res, next) {
	console.log('request recieved, ', req);
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods','GET,POST');
    res.set('Access-Control-Allow-Headers','X-Requested-With,Content-Type');
	next();
});


// Read all todos
app.get('/select', function(req, res){
	res.set('Access-Control-Allow-Origin', '*');
	try {
		var data = db.getData("/");
		data.todo.forEach(function(obj, index) {
			this.todo[index]['ID'] = index;
		}.bind(data));
	    res.send(JSON.stringify(data, null, 3));
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
	}
});

// Uodate a todo
app.get('/update', function(req, res){
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

	try {
    	res.send(JSON.stringify({error: false, data: db.getData('/todo')}, null, 3));
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
	}
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

		var c = 0;
		data.forEach(function(d, index) {
			data[index]['ID'] = ++c;
		});
    	res.send(JSON.stringify({error: false, data: data}, null, 3));
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

	try {
		var data = db.getData('/todo');

		var c = 0;
		data.forEach(function(d, index) {
			data[index]['ID'] = ++c;
		});
    	res.send(JSON.stringify({error: false, data: data}, null, 3));
	} catch (ex) {
		res.send(JSON.stringify({error: true, exception: ex.message}));
	}
});

app.listen(serverConfig.port, function() {
	console.log(sprintf("listening to port: %d", serverConfig.port));
});