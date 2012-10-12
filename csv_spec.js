describe('convertToCSVField', function(){
  var csv = require('./csv');

  it('should return a simple string unchanged', function(){
    expect(csv.convertToCSVField('A simple String')).toEqual('A simple String');
  });
  it('should remove double quotes', function(){
    expect(csv.convertToCSVField('"A double quoted String"')).toEqual(' A double quoted String ');
  });
  it('should remove commas', function(){
    expect(csv.convertToCSVField('A String, with commas, ')).toEqual('A String with commas ');
  });
  it('should remove new lines', function(){
    expect(csv.convertToCSVField('A String\nwith new lines\n')).toEqual('A String with new lines ');
  });
});

