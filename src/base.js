function Node() {
	this[ITEMS] = [];
	this[COUNT] = 0;
}

RadDog = function(uidData, title) {
	if(typeof uidData === 'string') {
		this.uid = uidData;
		this.title = title;
		this.index = new Node();
		this.items = {};
	}
	else {
		this.uid = uidData.uid;
		this.title = uidData.title;
		this.index = uidData.index;
		this.items = uidData.items;
	}
};

RadDog.prototype._getBranchCount = function(node) {
	var count = 0;
	for(var key in node)
		if(key[0] !== ' ' && node.hasOwnProperty(key))
			++count;
	return count;
};

RadDog.prototype._getFirstBranch = function(node) {
	for(var key in node)
		if(key[0] !== ' ' && node.hasOwnProperty(key))
			return {key: key, node: node[key]};
};

RadDog.prototype._getLongestPrefix = function(str1, str2) {
	var i, limit = str1.length > str2.length ? str2.length : str1.length;
	for(i = 0; i < limit && str1[i] === str2[i]; ++i);
	return str1.substr(0, i);
};

RadDog.prototype._bubble = function(path, delta) {
	var node, parent, child, key, combinedKey;
	for(var i = path.length - 1; i >= 0; --i) {
		key = path[i].key;
		node = path[i].node;
		node[COUNT] += delta;
		if(delta < 0) {
			// Delete a node or compress child nodes as needed
			if(i > 0 && node[COUNT] === 0) {
				parent = path[i - 1].node;
				delete parent[key];
			}
			else if(i > 0 && this._getBranchCount(node) === 1 && node[ITEMS].length === 0) {
				var onlyChild = this._getFirstBranch(node);
				parent = path[i - 1].node;
				child = onlyChild.node;
				combinedKey = key + onlyChild.key;
				parent[combinedKey] = child;
				delete parent[key];
			}
		}
	}
};

RadDog.prototype._lookup = function(token, partial) {
	// Underlying radix trie operation to lookup a node
	var currentNode = this.index;
	var unmatched = token;
	var path = [{key: '', node:currentNode}];
	while(unmatched.length) {
		var match = false;
		for(var key in currentNode) {
			if(key[0] !== ' ' && currentNode.hasOwnProperty(key) && unmatched.indexOf(key) === 0) {
				unmatched = unmatched.substr(key.length);
				currentNode = currentNode[key];
				path.push({key:key, node:currentNode});
				match = true;
				break;
			}
		}
		if(!match) {
			if(partial) {
				path[path.length - 1].unmatched = unmatched;
				return path;
			}
			return null;
		}
	}
	return path;
};

RadDog.prototype._insert = function(token, uid) {
	// Underlying radix trie operation to insert an item
	var node, path = this._lookup(token, true);
	if(path) {
		var entry = path[path.length - 1];
		if(entry.unmatched) {
			// Find longest prefix key in common with unmatched
			var bestPrefix = '', bestKey = null, newNode;
			node = entry.node;
			for(var key in node) {
				if(key[0] !== ' ' && node.hasOwnProperty(key)) {
					var prefix = this._getLongestPrefix(key, entry.unmatched);
					if(prefix.length > bestPrefix.length) {
						bestPrefix = prefix;
						bestKey = key;
					}
				}
			}
			if(bestKey) {
				// Split
				var splitKey = bestKey.substr(bestPrefix.length);
				newNode = new Node();
				newNode[COUNT] = node[bestKey][COUNT];
				newNode[splitKey] = node[bestKey];
				node[bestPrefix] = newNode;
				delete node[bestKey];
				entry.unmatched = entry.unmatched.substr(bestPrefix.length);
				path.push({key: bestPrefix, node:newNode});
				node = newNode;
			}
			// Add branch
			newNode = new Node();
			newNode[ITEMS].push(uid);
			node[entry.unmatched] = newNode;
			path.push({key: entry.unmatched, node:newNode});
		}
		else {
			node = path[path.length - 1].node;
			if(node[ITEMS].indexOf(uid) !== -1)
				return;
			node[ITEMS].push(uid);
		}
	}
	else {
		// Insert at the root
		node = new Node();
		node[ITEMS].push(uid);
		this.index[token] = node;
		path = [{key: '', node: this.index}, {key: token, node:node}];
	}
	this._bubble(path, 1);
};

RadDog.prototype._delete = function(token, uid) {
	// Underlying radix trie operation to delete an item
	var path = this._lookup(token);
	if(path.length > 1) {
		var node = path[path.length - 1].node;
		for(var i = 0; i < node[ITEMS].length; ++i) {
			if(node[ITEMS][i] === uid) {
				node[ITEMS].splice(i, 1);
				this._bubble(path, -1);
				break;
			}
		}
	}
};

RadDog.prototype.insert = function(item) {
	var tokens, existing, i;
	var uid = item[this.uid];

	// If the item is already indexed, then first unindex it
	if((existing = this.items[uid])) {
		tokens = existing[this.title].toLowerCase().split(' ');
		tokens = tokens.filter(function(val) {
			return !!val.length;
		});
		for(i = 0; i < tokens.length; ++i) {
			this._delete(tokens[i], uid);
		}
	}

	// Add all the tokens to the index
	tokens = item[this.title].toLowerCase().split(' ');
	tokens = tokens.filter(function(val) {
		return !!val.length;
	});
	for(i = 0; i < tokens.length; ++i) {
		this._insert(tokens[i], uid);
	}

	this.items[uid] = item;
};

RadDog.prototype.delete = function(item) {
	var uid = item[this.uid];
	if(!this.items[uid])
		return;
	var tokens = item[this.title].toLowerCase().split(' ');
	tokens = tokens.filter(function(val) {
		return !!val.length;
	});
	for(var i = 0; i < tokens.length; ++i) {
		this._delete(tokens[i], uid);
	}
	delete this.items[uid];
};
