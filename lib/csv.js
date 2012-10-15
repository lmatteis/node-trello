var convertToCSV = function(data, callback) {
	var csv = "";
	var title = data[0];
	for(key in title) {
		csv += key + ", ";
	}
	csv = csv.substr(0, csv.length-2);
	csv += '\n';

	for (var i=0; i < data.length; i++) {
		var card = data[i];
		for(key in card) {
			var prop = card[key].toString();
			prop = convertToCSVField(prop);
			csv += prop + ", ";
		}
		csv = csv.substr(0, csv.length-2);
		csv += '\n';
	}
	callback(null, csv);
}


//TODO: preserve quotes, commata and new lines. use csv-standard
var convertToCSVField = function (field) {
	field = field.replace(/"/g,' '); // remove "
	field = field.replace(/,/g,''); // remove ,
	field = field.replace(/\n/g, ' '); // remove new lines
	return field;
}


exports.convertToCSVField = module.exports.convertToCSVField = convertToCSVField;
exports.convertToCSV = module.exports.convertToCSV = convertToCSV;
