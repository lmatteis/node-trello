
var SandboxedModule = require('sandboxed-module');

/*
describe('appendListAndCardInfos', function() {
  var dummyApi = {
    get:function(path, callback) {
      var card1 = {name : 'a first card', id: 111};
      var card2 = {name : 'a second card (2)', id: 222, idMembers: ['abc', 'opc']};
      var list1 = {name: 'a first list', id: 123, cards : [card1]};
      var list2 = {name: 'a second list', id: 345, cards : [card2]};
      callback(null, [list1, list2]);          
    }
  };
  var sts = SandboxedModule.require('./stats', { locals: {api: dummyApi} });
  var data = [{card_id: '123'}];


  it('should append list infos', function(done) {
    sts.appendListAndCardInfos(data, function(error, newData) {
      expect(newData[0].list_name).toEqual('a first list');
      expect(newData[1].list_name).toEqual('a second list');
      done();
    });
  });
  it('should append card infos', function(done) {
    sts.appendListAndCardInfos(data, function(error, newData) {
      expect(newData[0].card_name).toEqual('a first card');
      expect(newData[0].card_id).toEqual(111);
      expect(newData[1].card_name).toEqual('a second card (2)');
      expect(newData[1].estimate).toEqual('2');
      expect(newData[1].idMembers).toEqual(['abc', 'opc']);
      done();
    });
  });
  

});
*/

/*
describe('filterOnlyReleased', function() {
  var sts = require('./stats');
  it('should filter only released items', function(done) {
    sts.filterOnlyReleased(data, function(error, newData) {
      done();
    })
  })
});
*/

describe('duplicateEntryForEachMember', function(){
  var sts = require('./stats');
  var data = [{card_id: '123', member_names : ['matt', 'dave']}];

  it('should duplicate an entry with two members assigned', function(done){
    sts.duplicateEntryForEachMember(data, function(error, newData) {
      expect(newData.length).toEqual(2);
      expect(newData[0].member).toEqual('matt');
      expect(newData[0].card_id).toEqual('123');
      expect(newData[1].member).toEqual('dave');
      expect(newData[1].card_id).toEqual('123');
      done();
    });
  });

  var data2 = [{card_id: '123', member_names : []}];
  it('should keep an entry with no members assigned', function(done){
    sts.duplicateEntryForEachMember(data2, function(error, newData) {
      expect(newData.length).toEqual(1);
      expect(newData[0].member).toEqual('<unknown>');
      expect(newData[0].card_id).toEqual('123');
      done();
    });
  });
});

describe('appendLabelInfosAndFeatureAreas', function () {
  var dummyApi = {
    get:function(path, callback) {
      var card = {name: 'a first board name', id: 123, labels: [{name:'a label'}, {name:'a 2nd label'}], desc: 'This is a description. FeatureArea:anarea '};
      callback(null, card);          
    }
  };
  var sts = SandboxedModule.require('./stats', { locals: {api: dummyApi} });
  var data = [{card_id: '123'}];

  it('should append labels', function (done) {
    sts.appendLabelInfosAndFeatureAreas(data, function(error, newData) {
      expect(newData[0].label).toEqual('a label');
      //expect(newData[1].label).toEqual('a 2nd label');
      done()
    });
  });
/*
  it('should append feature areas', function(done) {
    sts.appendLabelInfosAndFeatureAreas(data, function(error, newData) {
      expect(newData[0].feature_area).toEqual('anarea ');
      done()
    });
  });
*/
});


describe('convertToCSVField', function(){
  var sts = require('./stats');

  it('should return a simple string unchanged', function(){
    expect(sts.convertToCSVField('A simple String')).toEqual('A simple String');
  });
  it('should remove double quotes', function(){
    expect(sts.convertToCSVField('"A double quoted String"')).toEqual(' A double quoted String ');
  });
  it('should remove commas', function(){
    expect(sts.convertToCSVField('A String, with commas, ')).toEqual('A String with commas ');
  });
  it('should remove new lines', function(){
    expect(sts.convertToCSVField('A String\nwith new lines\n')).toEqual('A String with new lines ');
  });
});


