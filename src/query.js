function Cursor(data, query, filter) {
	var i, j, node, uid, root;
	this.data = data;
	this.query = query;
	this.filter = filter;
	root = this._lookup(query[query.length - 1], true);
	this.currentNode = root.node;
	this.currentIndex = 0;
	this.queue = [];
	this._enqueueChildren(root.unmatched);
	this.end = false;
	this.matchSet = null;
	if(query.length > 1) {
		this.matchSet = {};
		for(i = 0; i < query.length - 1; ++i) {
			node = this._lookup(query[i]);
			if(!node) {
				this.matchSet = null;
				this.end = true;
				return;
			}
			else {
				node = node.node;
				for(j = 0; j < node[ITEMS].length; ++j) {
					uid = node[ITEMS][j];
					this.matchSet[uid] = this.matchSet[uid] || 0;
					this.matchSet[uid] += 1;
				}
			}
		}
	}
}

Cursor.prototype._enqueueChildren = function(unmatched) {
	// Push child nodes in order of their keys
	var keys = [];
	for(var key in this.currentNode) {
		if(this.currentNode.hasOwnProperty(key))
			keys.push(key);
	}
	if(unmatched) {
		keys = keys.filter(function(value) {
			return value.indexOf(unmatched) === 0;
		});
	}
	keys.sort();
	for(var i = 0; i < keys.length; ++i) {
		if(keys[i][0] !== ' ')
			this.queue.push(this.currentNode[keys[i]]);
	}
};

Cursor.prototype._lookup = function(token, partial) {
	var currentNode = this.data.index;
	var unmatched = token;
	while(unmatched.length) {
		var match = false;
		for(var key in currentNode) {
			if(key[0] !== ' ' && currentNode.hasOwnProperty(key) && unmatched.indexOf(key) === 0) {
				unmatched = unmatched.substr(key.length);
				currentNode = currentNode[key];
				match = true;
				break;
			}
		}
		if(!match)
			return partial ? {node: currentNode, unmatched: unmatched} : null;
	}
	return {node: currentNode, unmatched: unmatched};
};

Cursor.prototype.next = function() {
	var uid, item;
	if(this.end)
		return null;

	while(this.currentIndex < this.currentNode[ITEMS].length) {
		uid = this.currentNode[ITEMS][this.currentIndex];
		this.currentIndex += 1;
		// If this.matchSet, ensure that it has a matchSet count of query.length - 1
		if(this.matchSet === null || this.matchSet[uid] >= (this.query.length - 1)) {
			item = this.data.items[uid];
			if(!this.filter || this.filter(item)) {
				return item;
			}
		}
	}

	if(this.currentIndex >= this.currentNode[ITEMS].length) {
		if(this.queue.length === 0) {
			this.end = true;
			return null;
		}
		this.currentNode = this.queue.shift();
		this._enqueueChildren();
		this.currentIndex = 0;
		return this.next();
	}
};

Cursor.prototype.remaining = function() {
	// Call next into an array
	var match, results = [];
	while((match = this.next()))
		results.push(match);
	return results;
};

/* exported get */
/* exported search */
/* exported QueryDog */

function get(uid) {
	return this.items[uid];
}

function search(query, filter) {
	// When multi-word find the first set of items exactly, then inexact substring matching for the last word
	// Optional filter callback - can provide all ways of filtering the results
	// e.g. ordered (words must appear in the same order), or anchored (words must start at the begining of the title)
	query = query.toLowerCase().split(' ');
	query = query.filter(function(val) {
		return !!val.length;
	});
	return new Cursor(this, query, filter);
}

function QueryDog(data) {
	// Copy all of the fields
	this.uid = data.uid;
	this.title = data.title;
	this.index = data.index;
	this.items = data.items;
}
