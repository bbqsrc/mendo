var vows = require('vows'),
    assert = require('assert'),
    mendo = require('../mendo.js').mendo;

function makeTopic() {
    return {
        simpleDocs: mendo([
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
        ]),
        complexDocs: mendo([
            { lists: ['bar', 'baz'] }
        ])
    };
}

vows.describe("Mendo").addBatch({
    'A mendo object': {
        'finds the correct objects': {
            topic: makeTopic(),

            'with simple keys': {
                'and nothing else': function(topic) {
                    var result = topic.simpleDocs.find({a : 5});
                    assert.lengthOf(result, 1);
                    assert.includes(result[0], 'a');
                    assert.equal(result[0].a, 5);
                },

                'when using $exists': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ c: { $exists: true }}), 7);
                    assert.lengthOf(topic.simpleDocs.find({ c: { $exists: false }}), 5);
                },

                'when using $or': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ $or : [{a : 3}, {b : 2}] }), 5);
                },

                'when using $and': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ $and : [{a : 3}, {b : 2}] }), 1);
                },

                'when using $gt': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ a : { $gt : 4 }}), 1);
                },

                'when using $gte': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ a : { $gte : 4 }}), 2);
                },

                'when using $lt': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ a : { $lt : 4 }}), 4);
                },

                'when using $lte': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ a : { $lte : 4 }}), 5);
                },

                'when using $in': function(topic) {
                    var o = topic.complexDocs.find({ lists: { $in : ['foo', 'bar'] }});
                    assert.lengthOf(o, 1);
                },

                'when using $nin': function(topic) {
                    var o = topic.complexDocs.find({ lists: { $nin : ['foo', 'bar'] }});
                    assert.lengthOf(o, 0);
                },

                'when using $ne': function(topic) {
                    var o = topic.simpleDocs.find({ a : { $ne : 4 }});
                    assert.lengthOf(o, 11);
                }
            },

            'with complex keys': {
                'and nothing else': function(topic) {
                    var result = topic.simpleDocs.find({'a.b.c' : 42});
                    assert.lengthOf(result, 1);
                },

                'when using $exists': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ 'a.b.c': { $exists: true }}), 1);
                    assert.lengthOf(topic.simpleDocs.find({ 'a.b.d': { $exists: true }}), 2);
                    assert.lengthOf(topic.simpleDocs.find({ 'a.b': { $exists: false }}), 10);
                },

                'when using $or': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ $or : [{'a.b.c' : 42}, {'a.b.d' : 100}] }), 2);
                },

                'when using $and': function(topic) {
                    assert.lengthOf(topic.simpleDocs.find({ $and : [{'a.b.c' : 42}, {'a.b.d' : 12}] }), 1);
                }
            }
        },

        'updates objects correctly': {
            topic: makeTopic(),

            'when using $set': function(topic) {
                var result = topic.simpleDocs.update({a: 4}, { $set: {c: 42} });
                assert.lengthOf(result, 1);
                assert.equal(result[0].c, 42);
            },

            'when using $push': function(topic) {
                var result = topic.complexDocs.update({lists: { $exists: true }}, { $push: { lists: 42 } });
                assert.equal(result[0].lists[2], 42);
            },

            'when using $inc': function(topic) {
                var result = topic.simpleDocs.update({a: 4}, { $inc: { a: 38 } });
                assert.equal(result[0].a, 42);
            }
        }
    }
}).export(module);