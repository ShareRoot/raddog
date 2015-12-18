About
-------------------------------
RadDog is a simple, modifiable item-title search index based on radix tries. Its primary use case is for building auto-completion indexes that can be loaded and queried directly from the browser. For example, the query `sweat` may yield the items corresponding to the following titles that have been indexed: `Ugly Christmas Sweater`, `Blue Sweatpants`, and `Sweater`.

Example Code
-------------------------------

```javascript
// Demonstrates how to insert, delete, and search
var dog = new RadDog('uid', 'title');
var item1 = {uid: '1', title: 'Ugly Christmas Sweater', ...other data};
var item2 = {uid: '2', title: 'Blue Sweatpants', ...other data};
var item3 = {uid: '3', title: 'Sweater', ...other data};
var item4 = {uid: '4', title: 'Dog Treats', ...other data};
dog.insert(item1);
dog.insert(item2);
dog.insert(item3);
dog.insert(item4);
var cursor = dog.search('sweater');
var matches = cursor.remaining();
// matches = [item1, item2, item3]
dog.delete(item2);
var cursor = dog.search('sweater', function(item) { return (item.title.indexOf('Ugly') !== -1); });
var matches = cursor.remaining();
// matches = [item1]
```

Update Methods
-------------------------------

#### Constructor

**RadDog(uid or data, title)**

* `uid` or `data` - when inserting an item, which field contains the uid (unique id) of the item to use in the trie for indexing items. Or data being a serialized version of a RadDog index.
* `title` - when inserting an item, which field contains the title to index.

#### Insert

**insert(item)**

* `item` - takes the title of the item, tokenizes it into lowercase tokens and adds an entry in the trie for the item's uid for each token. Item is then saved in a `uid:item` dictionary for later querying.

#### Delete

**delete(item)** - finds all entries of the title tokens in the trie and removes the item's uid and also removes the item from the `uid:item` dictionary.

#### Serializing

Simply call `JSON.stringify()` on your RadDog object. This will give you index data to save and later load into the constructor or `prepare()` in a readonly setting.

Query Methods
-------------------------------

#### Get

**get(uid)**

Returns an item that has the uid or undefined if items is not currently indexed.

* `uid` - uid of the item you want to get.

#### Search

**search(query[, filter])**

Search takes a string, tokenizes around the spaces and lowercases each token. The cursor then returns results for items that have exact matches for all of the tokens (except that last token). The last token can be a partial match, because it is assumed the user is in the middle of typing the last token.

Returns a cursor object for iterating over search results.

* `query` - Arbitrary user input, can have many tokens.
* `filter` - Optional callback method to accept and item and apply another filter to it. Return true to include in the search results, and false to exclude.

#### Cursor Object

**next()**

Walk to the next result in the trie and return the item. Returns null when there are no more matching items.

**remaining()**

A convenience method to building an array of items by calling `next()` until the end is reached.
	
**end**

A variable that will be set to true once the end is reached.

QueryDog
-------------------------------

As a convenience, raddog also comes with querydog.js a smaller readonly version of RadDog that only contains the query methods described above. Since the constructor is not included in querydog.js you must use the following method to prepare the index data loaded.

#### Prepare

**prepare(data)**

Simply attaches the `get` and `search` methods to the loaded index data object. 

#### Example Code

```javascript
var dog = new RadDog('uid', 'title');
//......create an index
var serialized = JSON.stringify(dog);
var queryOnlyDog = QueryDog.prepare(JSON.parse(serialized));
var cursor = queryOnlyDog.search('Sweater');
//......use cursor
```

License
-------------------------------
MIT