var moment = require('moment');


var Sprint = function(start, end) {
	this.dates = {} ;
	var s = moment(start).clone().minutes(0).seconds(0).milliseconds(0);
	var f = moment(end).minutes(0).seconds(0).milliseconds(0);
	while(s.unix() <= f.unix()) {
		this.dates[moment(s).clone().toDate()] = { 'totalpoints':0 , 'donepoints':0 };
		s.add('days', 1);
	}
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

Sprint.prototype.asArray = function() {
	var array = [];
	for(key in this.dates) {
		array.push({'date':key, 'totalpoints':this.dates[key].totalpoints, 'donepoints':this.dates[key].donepoints })
	}
	return array;
}

exports = module.exports = Sprint;
