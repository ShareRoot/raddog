var assert = require('assert');
var _ = require('lodash');
var RadDog = require('./src/base');

describe('single item radix trie _operations', function(){
	before(function(done) {
		dog = new RadDog('uid', 'title');
		done();
	});
	it('should _lookup "sweater" as null', function() { assert.equal(dog._lookup('sweater'), null); });
	it('should _insert "sweater"', function() {
		var path;
		dog._insert('sweater', 'sweater-uid');
		assert.ok(dog.index.sweater);
		path = dog._lookup('sweater');
		assert.equal(path[0].node, dog.index);
		assert.equal(path[1].node, dog.index.sweater);
		assert.equal(dog.index[' count'], 1);
		assert.equal(dog.index[' items'].length, 0);
		assert.equal(dog.index.sweater[' count'], 1);
		assert.equal(dog.index.sweater[' items'].length, 1);
		assert.equal(dog.index.sweater[' items'][0], 'sweater-uid');
	});
	it('should _delete "sweater"', function() {
		dog._delete('sweater');
		assert.equal(dog._lookup('sweater'), null);
		assert.equal(dog.index[' count'], 0);
		assert.equal(dog.index[' items'].length, 0);
	});
});

describe('multiple item radix trie _operations', function(){
	before(function(done) {
		dog = new RadDog('uid', 'title');
		done();
	});
	it('should _insert "dog", "dot", "doggy", "dock"', function() {
		var path;
		dog._insert('dog', 'dog-uid');
		dog._insert('dot', 'dot-uid');
		dog._insert('doggy', 'doggy-uid');
		dog._insert('dock', 'dock-uid');
		// "do" prefix should be split
		path = dog._lookup('dog');
		assert.equal(path.length, 3);
		path = dog._lookup('dot', 'dot-uid');
		assert.equal(path.length, 3);
		path = dog._lookup('doggy', 'doggy-uid');
		assert.equal(path.length, 4);
		path = dog._lookup('dock', 'dock-uid');
		assert.equal(path.length, 3);
	});
	it('should _delete "dog" and collapse', function() {
		dog._delete('dog');
		console.log(dog.index);
		path = dog._lookup('doggy', 'doggy-uid');
		assert.equal(path.length, 3);
	});
});
