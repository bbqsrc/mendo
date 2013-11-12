var vows = require('vows'),
    assert = require('assert'),
    mendo = require('../mendo.js').mendo;

function makeTopic() {
    return mendo([
        { a: 5, b: 5, c: null },
        { a: 3, b: null, c: 8 },
        { a: null, b: 3, c: 9 },
        { a: 1, b: 2, c: 3 },
        { a: 2, c: 5 },
        { a: 3, b: 2 },
        { a: 4 },
        { b: 2, c: 4 },
        { b: 2 },
        { c: 6 },
        { a : { b : { c: 42, d: 12 } } },
        { a : { b : { d: 100 } } }
    ]);
}

vows.describe("Mendo").addBatch({
    'A mendo object': {
        'finds the correct objects': {
            topic: makeTopic(),

            'with simple keys': {
                'and nothing else': function(topic) {
                    var result = topic.find({a : 5});
                    assert.lengthOf(result, 1);
                    assert.includes(result[0], 'a');
                    assert.equal(result[0].a, 5);
                },

                'when using $exists': function(topic) {
                    assert.lengthOf(topic.find({ c: { $exists: true }}), 7);
                    assert.lengthOf(topic.find({ c: { $exists: false }}), 5);
                },

                'when using $or': function(topic) {
                    assert.lengthOf(topic.find({ $or : [{a : 3}, {b : 2}] }), 5);
                },

                'when using $and': function(topic) {
                    assert.lengthOf(topic.find({ $and : [{a : 3}, {b : 2}] }), 1);
                }
            },

            'with complex keys': {
                'and nothing else': function(topic) {
                    var result = topic.find({'a.b.c' : 42});
                    assert.lengthOf(result, 1);
                },

                'when using $exists': function(topic) {
                    assert.lengthOf(topic.find({ 'a.b.c': { $exists: true }}), 1);
                    assert.lengthOf(topic.find({ 'a.b.d': { $exists: true }}), 2);
                    assert.lengthOf(topic.find({ 'a.b': { $exists: false }}), 10);
                },

                'when using $or': function(topic) {
                    assert.lengthOf(topic.find({ $or : [{'a.b.c' : 42}, {'a.b.d' : 100}] }), 2);
                },

                'when using $and': function(topic) {
                    assert.lengthOf(topic.find({ $and : [{'a.b.c' : 42}, {'a.b.d' : 12}] }), 1);
                }
            }
        },

        'updates objects correctly': {
            topic: makeTopic(),

            'when using $set': function(topic) {
                var result = topic.update({a: 4}, { $set: {c: 42} });
                assert.lengthOf(result, 1);
                assert.equal(result[0].c, 42);
            }
        }
    }
}).export(module);