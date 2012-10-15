describe('sprint', function(){
  var Sprint = require('../lib/sprint');

  var sprint = new Sprint(new Date(2012, 01, 02), new Date(2012, 01, 10))

  it('should have set up the correct dates', function(){
    expect(sprint.asArray().length).toEqual(9);
  });

  it('should return start and enddate', function(){
    expect(sprint.startDate().toString()).toEqual(new Date(2012, 01, 02).toString());
    expect(sprint.endDate().toString()).toEqual(new Date(2012, 01, 10).toString());
  });

  it('should contain data for the dates', function(){
    expect(sprint.get(new Date(2012, 01, 02))).toEqual({ totalpoints : 0, donepoints : 0 } );
    expect(sprint.get(new Date(2012, 01, 09))).toEqual({ totalpoints : 0, donepoints : 0 } );
  });

  it('shouldnt contain data for other dates', function(){
    expect(sprint.get(new Date(2012, 01, 01))).toEqual(null);
    expect(sprint.get(new Date(2012, 01, 11))).toEqual(null);
  });

  it('should add points for a single day', function(){
    expect(sprint.get(new Date(2012, 01, 02))).toEqual({ totalpoints : 0, donepoints : 0 } );
    sprint.add(new Date(2012, 01, 02), 1, 0);
    expect(sprint.get(new Date(2012, 01, 02))).toEqual({ totalpoints : 1, donepoints : 0 } );
    sprint.add(new Date(2012, 01, 02), 1, 1);
    expect(sprint.get(new Date(2012, 01, 02))).toEqual({ totalpoints : 2, donepoints : 1 } );
  });

  it('should get data even if hours and minutes are wrong', function(){
    sprint.add(new Date(2012, 01, 03), 7, 6);
    expect(sprint.get(new Date(2012, 01, 03, 11))).toEqual({ totalpoints : 7, donepoints : 6 } );
    expect(sprint.get(new Date(2012, 01, 03, 11, 11, 22))).toEqual({ totalpoints : 7, donepoints : 6 } );
  });

  it('should add points for the rest of the sprint', function(){
    expect(sprint.get(new Date(2012, 01, 04))).toEqual({ totalpoints : 0, donepoints : 0 } );
    sprint.addUntilEnd(new Date(2012, 01, 04), 1, 0);
    expect(sprint.get(new Date(2012, 01, 04))).toEqual({ totalpoints : 1, donepoints : 0 } );
    expect(sprint.get(new Date(2012, 01, 05))).toEqual({ totalpoints : 1, donepoints : 0 } );
    expect(sprint.get(new Date(2012, 01, 06))).toEqual({ totalpoints : 1, donepoints : 0 } );
    sprint.addUntilEnd(new Date(2012, 01, 04), 1, 2);
    expect(sprint.get(new Date(2012, 01, 07))).toEqual({ totalpoints : 2, donepoints : 2 } );
    expect(sprint.get(new Date(2012, 01, 08))).toEqual({ totalpoints : 2, donepoints : 2 } );
    expect(sprint.get(new Date(2012, 01, 09))).toEqual({ totalpoints : 2, donepoints : 2 } );
  });





});

