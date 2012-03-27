var TrelloBackup = require("./backup.js");


//config
var app_key = '<app_key>';
var oauth_access_token = '<oauth_access_token>';
var organization = '<organization>';
var data_type = 'csv'; //json, csv
var ignore_attributes = ['closed', 'card-closed', 'card-idList', 'idBoard']; // 'id', 'name', 'closed', 'idBoard', 'card-id', 'card-name', 'card-desc', 'card-closed', 'card-idList', 'card-idBoard', 'card-idMembers', 'card-url'

//usage
var tb = new TrelloBackup(app_key, oauth_access_token, organization, data_type, ignore_attributes);
tb.backupOrganization();