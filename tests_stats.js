var assert = require('assert'),
    TrelloStats = require('./stats.js');

var ts = new TrelloStats('appkey', 'token', 'boardid');

var tests = {
    testSumPointsPerLists: function(){
        var lists = [{name:'list1', cards:[]}, 
                    {name:'list2', cards:[{name:'card1 (1)'}, {name:'card2 (1)'}]}];
        assert.equal(0, ts.sumPointsPerLists(lists).list1);
        assert.equal(2, ts.sumPointsPerLists(lists).list2);
    }
};

console.log('Starting tests...');
for(var i in tests) {
    tests[i]();
}
console.log('... finshed.');
