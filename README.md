# Mendo

MongoDB-style document manipulation for objects within arrays, in JavaScript (including in the browser).

It's tre<strong>mendo</strong>us!

## Usage

Use the `mendo` method to wrap an array. The resultant object has a `find`, `findOne` and `update` method that can be used in the same manner that the MongoDB methods of the same name work.

### Supported Operators

* $and
* $or
* $not
* $exists
* $where

#### Update Operators

* $set
