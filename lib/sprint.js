var moment = require('moment');


var Sprint = function(start, end) {
	this.dates = {};
	var self = this;
	forEachDay(start, end, function(date) {
		self.dates[date] = { 'totalpoints':0 , 'donepoints':0 };
	});
};

Sprint.prototype.get = function(date) {
	for(key in this.dates) {
		if(moment(key).format('YYYYDDMM') == moment(date).format('YYYYDDMM')) return this.dates[key];
	}
	return null;
}

Sprint.prototype.add = function(date, total, done) {
	var d = this.get(date);
	if(d == null) return;
	d.totalpoints += total;
	d.donepoints += done;
	return;
}

Sprint.prototype.addUntilEnd = function(date, total, done) {
	var self = this;
	//Fixme: Cleaner way to get last key of object
	var end;
	for(key in this.dates) {
		end = key;
	}
	forEachDay(date, end, function(d) {
		self.add(d, total, done);
	});
	return;
}

Sprint.prototype.asArray = function() {
	var array = [];
	for(key in this.dates) {
		array.push({'date':key, 'totalpoints':this.dates[key].totalpoints, 'donepoints':this.dates[key].donepoints })
	}
	return array;
}

//helper function to iterate over days
function forEachDay(start, end, cb) {
	var s = moment(start).clone().minutes(0).seconds(0).milliseconds(0);
	var f = moment(end).minutes(0).seconds(0).milliseconds(0);
	while(s.unix() <= f.unix()) {
		cb(moment(s).clone().toDate())
		s.add('days', 1);
	}
}


exports = module.exports = Sprint;
