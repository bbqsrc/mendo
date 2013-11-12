/*
 This file is part of Mendo.
 Copyright (c) 2013  Brendan Molloy

 Mendo is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Mendo is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Mendo.  If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
    "use strict";

    function isObject(o) {
        return Object.prototype.toString.call(o) == "[object Object]";
    }

    function extend(/* varargs */) {
        var out = {},
            i, ii, o, prop;

        for (i = 0, ii = arguments.length; i < ii; ++i) {
            o = arguments[i];

            if (o == null) {
                continue;
            }

            for (prop in o) {
                out[prop] = o[prop];
            }
        }

        return out;
    }

    function $or(o, params, key) {
        var i, ii, query;

        for (i = 0, ii = params.length; i < ii; ++i) {
            query = params[i];

            if (this._matches(o, query, key)) {
                return true;
            }
        }

        return false;
    }

    function $and(o, params, key) {
        var i, ii, query;

        for (i = 0, ii = params.length; i < ii; ++i) {
            query = params[i];

            if (!this._matches(o, query, key)) {
                return false;
            }
        }

        return true;
    }

    function $not() {
        return !this._matches.apply(this, arguments);
    }

    function $exists(o, value, key) {
        return (resolveAndGet(o, key) !== undefined) === value;
    }

    function $where(o, func) {
        if (typeof func == "string") {
            func = new Function(func);
        }
        return !!func.call(o);
    }

    function $set(o, obj) {
        var prop;

        for (prop in obj) {
            resolveAndSet(o, prop, obj[prop]);
        }
    }

    /* XXX: needs to be updated to use resolvers
    function $rename(o, obj) {
        var tmp = {},
            oldName;

        for (oldName in obj) {
            if (o[oldName] !== undefined) {
                tmp[oldName] = o[oldName];
                delete o[oldName];
            }
        }

        for (oldName in tmp) {
            o[obj[oldName]] = tmp[oldName];
        }
    }
    */

    var defaultQueryOperators = {
        $or: $or,
        $and: $and,
        $not: $not,
        $exists: $exists,
        $where: $where
    };

    var defaultUpdateOperators = {
        $set: $set//,
        //$rename: $rename
    };

    function Mendo(context, queryOperators, updateOperators) {
        this.context = context;
        this._queryOperators = extend(defaultQueryOperators, queryOperators);
        this._updateOperators = extend(defaultUpdateOperators, updateOperators);
    }

    function resolveAndGet(obj, ref) {
        var i, ii,
            cur = obj,
            lastIndex;

        if (ref == null || typeof ref != "string" || ref.length == 0) {
            throw new Error("ref must not be null or blank string");
        }

        ref = ref.split('.');
        lastIndex = Math.max(ref.length-1, 0);

        for (i = 0, ii = lastIndex; i < ii; ++i) {
            if (!isObject(cur[ref[i]])) {
                return undefined;
            }

            cur = cur[ref[i]];
        }

        return cur[ref[lastIndex]];
    }

    function resolveAndSet(obj, ref, value) {
        var i, ii,
            cur = obj,
            lastIndex;

        if (ref == null || typeof ref != "string" || ref.length == 0) {
            throw new Error("ref must not be null or blank string");
        }

        ref = ref.split('.');
        lastIndex = Math.max(ref.length-1, 0);

        for (i = 0, ii = lastIndex; i < ii; ++i) {
            if (!isObject(cur[ref[i]])) {
                cur[ref[i]] = {};
            }

            cur = cur[ref[i]];
        }

        return cur[ref[lastIndex]] = value;
    }

    Mendo.prototype.find = function(query) {
        var i, ii,
            doc = this.context,
            out = [];

        for (i = 0, ii = doc.length; i < ii; ++i) {
            if (this._matches(doc[i], query)) {
                out.push(doc[i]);
            }
        }

        return out;
    }

    Mendo.prototype.findOne = function(query) {
        var i, ii,
            doc = this.context;

        for (i = 0, ii = doc.length; i < ii; ++i) {
            if (this._matches(doc[i], query)) {
                return doc[i];
            }
        }

        return null;
    }

    Mendo.prototype.update = function(query, obj) {
        // TODO: finish implementing this method

        var records = this.find(query),
            record,
            prop,
            i, ii;

        for (i = 0, ii = records.length; i < ii; ++i) {
            record = records[i];

            for (prop in obj) {
                if (prop in this._updateOperators) {
                    this._updateOperators[prop].call(this, record, obj[prop]);
                }
            }
        }

        return records;
    }

    Mendo.prototype._matches = function(object, query, key) {
        var prop;

        for (prop in query) {
            if (prop in this._queryOperators) {
                if (!this._queryOperators[prop].call(this, object, query[prop], key)) {
                    return false;
                }
            } else if (isObject(query[prop])) {
                return this._matches(object, query[prop], prop);
            } else if (resolveAndGet(object, prop) !== query[prop]) {
                return false;
            }
        }

        return true;
    }

    // Mendo default instance!
    this.mendo = function(context, queryOperators, updateOperators) {
        return new Mendo(context, queryOperators, updateOperators);
    };

    // Put it on the namespace because victory
    this.mendo.Mendo = Mendo;
}).call(typeof exports == 'undefined' ? this : exports);