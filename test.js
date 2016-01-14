var assert = require('assert');
var _ = require('lodash');
var RadDog = require('./dist/raddog');

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
		dog._delete('sweater', 'sweater-uid');
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
		dog._delete('dog', 'dog-uid');
		path = dog._lookup('doggy', 'doggy-uid');
		assert.equal(path.length, 3);
	});
});

describe('multiple item radix trie _operations', function(){
	before(function(done) {
		dog = new RadDog('uid', 'title');
		dog.insert({title:'nike roshe', uid: 'nike roshe uid'});
		dog.insert({title:'nike dunk high', uid: 'nike dunk womens uid'});
		dog.insert({title:'nike dunk sb low', uid: 'nike dunk mens uid'});
		dog.insert({title:'NIKE dunk high', uid: 'nike dunk mens uid'});
		dog.insert({title:'nike air force one', uid: 'nike air force one uid'});
		dog.insert({title:'nike freeruns', uid: 'nike freeruns uid'});
		dog.insert({title:'nike floaters', uid: 'nike floaters uid'});
		dog.insert({title:'nike flow', uid: 'nike flow uid'});
		done();
	});
	it('should find nike roshe item', function() {
		var cursor = dog.search('nike roshe');
		var item = cursor.next();
		assert.equal(item.uid, 'nike roshe uid');
	});
	it('should be able to assign two uids to one title', function() {
		var cursor = dog.search('nike dunk high');
		var item = cursor.next();
		assert.equal(cursor.end, false);
		var uid1 = item.uid;
		item = cursor.next();
		assert.notEqual(uid1, item.uid);
		item = cursor.next();
		assert.equal(cursor.end, true);
		assert.equal(item, null);
	});
	it('should be able to do partial searches', function() {
		var cursor = dog.search('nike f');
		var item = cursor.next();
		var uid1 = item.uid;
		var title1 = item.title;
		item = cursor.next();
		assert.notEqual(uid1, item.uid);
		assert.notEqual(title1, item.title);
		var uid2 = item.uid;
		var title2 = item.title;
		item = cursor.next();
		assert.notEqual(uid1, item.uid);
		assert.notEqual(title1, item.title);
		assert.notEqual(uid2, item.uid);
		assert.notEqual(title2, item.title);
		item = cursor.next();
		item = cursor.next();
		assert.equal(cursor.end, true);
		assert.equal(item, null);
	});
	it('should return empty query set when searching for an empty string', function() {
		var cursor = dog.search('');
		var item = cursor.next();
		assert.equal(cursor.end, true);
		assert.equal(item, null);
	});
});
