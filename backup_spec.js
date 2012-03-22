var tb = require("./backup2.js");

describe('convertToCSVField', function(){
  it('should return a simple string unchanged', function(){
    expect(tb.convertToCSVField('A simple String')).toEqual('A simple String');
  });
  it('should remove double quotes', function(){
    expect(tb.convertToCSVField('"A double quoted String"')).toEqual(' A double quoted String ');
  });
  it('should remove commas', function(){
    expect(tb.convertToCSVField('A String, with commas, ')).toEqual('A String with commas ');
  });
  it('should remove new lines', function(){
    expect(tb.convertToCSVField('A String\nwith new lines\n')).toEqual('A String with new lines ');
  });
});

/* TODO
describe('appendBoardInfos', function(){
  it('should run', function(){
  	tb.api = function() {};

  	tb.appendBoardInfos(null);
    expect("".toEqual('A simple String'));
  });
});
*/