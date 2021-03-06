/**
 * @fileoverview <p>This module provides implementations of the Binary,
 * ByteArray, and ByteString classes as defined in the <a
 * href="http://wiki.commonjs.org/wiki/Binary/B">CommonJS Binary/B</a>
 * proposal.
 *
 * <p>The JavaScript Binary class serves as common base class for ByteArray and
 * ByteString and can't be instantiated. ByteArray implements a modifiable and
 * resizable byte buffer, while ByteString implements an immutable byte
 * sequence. The ByteArray and ByteString constructors can take several
 * arguments. Have a look at the proposal for details.</p>
 *
 * <p>When passed to a Java method that expects a byte array, instances of thes
 * class are automatically unwrapped. Use the {@link #unwrap()} method to
 * explicitly get the wrapped Java byte array.</p>
 */

defineClass(org.ringojs.wrappers.Binary);

module.shared = true;

/**
 * Abstract base class for ByteArray and ByteString
 * @constructor
 */
exports.Binary = Binary;

/**
 * Constructs a writable and growable byte array.
 * @param {Binary|Array|String} content the content of the ByteArray. If the first argument
 *        is a String, the constructor requires a second argument containing the
 *        name of the String's encoding. If called without arguments, an empty ByteString
 *        is returned.
 * @param {String} charset the encoding name if the first argument is a String.
 * @constructor
 */
exports.ByteArray = ByteArray;

/**
 * Constructs an immutable byte string.
 * @param {Binary|Array|String} content the content of the ByteString. If the first argument
 *        is a String, the constructor requires a second argument containing the
 *        name of the String's encoding. If called without arguments, an empty ByteString
 *        is returned.
 * @param {String} charset the encoding name if the first argument is a String.
 * @constructor
 */
exports.ByteString = ByteString;

/**
 * Converts the String to a mutable ByteArray using the specified encoding.
 * @param {String} charset the name of the string encoding. Defaults to 'UTF-8'
 * @returns a ByteArray representing the string
 */
Object.defineProperty(String.prototype, 'toByteArray', {
    value: function(charset) {
        charset = charset || 'utf8';
        return new ByteArray(String(this), charset);
    }
});

/**
 * Converts the String to an immutable ByteSTring using the specified encoding.
 * @param {String} charset the name of the string encoding. Defaults to 'UTF-8'
 * @returns a ByteArray representing the string
 */
Object.defineProperty(String.prototype, 'toByteString', {
    value: function(charset) {
        charset = charset || 'utf8';
        return new ByteString(String(this), charset);
    }
});

/**
 * Reverses the content of the ByteArray in-place
 * @returns {ByteArray} this ByteArray with its elements reversed
 */
Object.defineProperty(ByteArray.prototype, 'reverse', {
    value: function() {
        return Array.reverse(this);
    }
});

/**
 * Sorts the content of the ByteArray in-place.
 * @param {Function} comparator the function to compare entries
 * @returns {ByteArray} this ByteArray with its elements sorted
 */
Object.defineProperty(ByteArray.prototype, 'sort', {
    value: function(fn) {
        fn = fn || function(a, b) a - b;
        return Array.sort(this, fn);
    }
});

/**
 * Apply a function for each element in the ByteArray.
 * @param {Function} fn the function to call for each element
 * @param {Object} thisObj optional this-object for callback
 */
Object.defineProperty(ByteArray.prototype, 'forEach', {
    value: function(fn, thisObj) {
        Array.forEach(this, fn, thisObj);
    }
});

/**
 * Return a ByteArray containing the elements of this ByteArray for which
 * the callback function returns true.
 * @param {Function} callback the filter function
 * @param {Object} thisObj optional this-object for callback
 * @returns {ByteArray} a new ByteArray
 */
Object.defineProperty(ByteArray.prototype, 'filter', {
    value: function(fn, thisObj) {
        return new ByteArray(Array.filter(this, fn, thisObj));
    }
});

/**
 * Tests whether some element in the array passes the test implemented by the provided function.
 * @param {Function} callback the callback function
 * @param {Object} thisObj optional this-object for callback
 * @returns {Boolean} true if at least one invocation of callback returns true
 */
Object.defineProperty(ByteArray.prototype, 'some', {
    value: function(fn, thisObj) {
        return Array.some(this, fn, thisObj);
    }
});

/**
 * Tests whether all elements in the array pass the test implemented by the provided function.
 * @param {Function} callback the callback function
 * @param {Object} thisObj optional this-object for callback
 * @returns {Boolean} true if every invocation of callback returns true
 */
Object.defineProperty(ByteArray.prototype, 'every', {
    value: function(fn, thisObj) {
        return Array.every(this, fn, thisObj);
    }
});

/**
 * Returns a new ByteArray whose content is the result of calling the provided function
 * with every element of the original ByteArray
 * @param {Function} callback the callback
 * @param {Object} thisObj optional this-object for callback
 * @returns {ByteArray} a new ByteArray
 */
Object.defineProperty(ByteArray.prototype, 'map', {
    value: function(fn, thisObj) {
        return new ByteArray(Array.map(this, fn, thisObj));
    }
});

/**
 * Apply a function to each element in this ByteArray as to reduce its content to a single value.
 * @param {Function} callback the function to call with each element of the ByteArray
 * @param initialValue optional argument to be used as the first argument to the first call to the callback
 * @returns the return value of the last callback invocation
 * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/reduce
 */
Object.defineProperty(ByteArray.prototype, 'reduce', {
    value: function(fn, initialValue) {
        return initialValue === undefined ?
               Array.reduce(this, fn) :
               Array.reduce(this, fn, initialValue);
    }
});

/**
 * Apply a function to each element in this ByteArray starting at the last element as to reduce
 * its content to a single value.
 * @param {Function} callback the function to call with each element of the ByteArray
 * @param initialValue optional argument to be used as the first argument to the first call to the callback
 * @returns the return value of the last callback invocation
 * @see ByteArray.prototype.reduce
 * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/reduceRight
 */
Object.defineProperty(ByteArray.prototype, 'reduceRight', {
    value: function(fn, initialValue) {
        return initialValue === undefined ?
               Array.reduceRight(this, fn) :
               Array.reduceRight(this, fn, initialValue);
    }
});

/**
 * Removes the last element from an array and returns that element.
 * @returns {Number}
 */
Object.defineProperty(ByteArray.prototype, 'pop', {
    value: function() {
        return Array.pop(this);
    }
});

/**
 * Appends the given elements and returns the new length of the array.
 * @param {Number} num... one or more numbers to append
 * @returns {Number} the new length of the ByteArray
 */
Object.defineProperty(ByteArray.prototype, 'push', {
    value: function() {
        return Array.prototype.push.apply(this, arguments);
    }
});

/**
 * Removes the first element from the ByteArray and returns that element.
 * This method changes the length of the ByteArray 
 * @returns {Number} the removed first element
 */
Object.defineProperty(ByteArray.prototype, 'shift', {
    value: function() {
        return Array.shift(this);
    }
});

/**
 * Adds one or more elements to the beginning of the ByteArray and returns its new length.
 * @param {Number} num... one or more numbers to append
 * @returns {Number} the new length of the ByteArray
 */
Object.defineProperty(ByteArray.prototype, 'unshift', {
    value: function() {
        return Array.prototype.unshift.apply(this, arguments);
    }
});

/**
 * Changes the content of the ByteArray, adding new elements while removing old elements.
 * @param {Number} index the index at which to start changing the ByteArray
 * @param {Number} howMany The number of elements to remove at the given position
 * @param {Number} elements... the new elements to add at the given position
 */
Object.defineProperty(ByteArray.prototype, 'splice', {
    value: function() {
        return new ByteArray(Array.prototype.splice.apply(this, arguments));
    }
});

/**
 * Copy a range of bytes between start and stop from this object to another ByteArray at the given target offset.
 * @param {Number} start
 * @param {Number} end
 * @param {ByteArray} target
 * @param {Number} targetOffset
 * @name ByteArray.prototype.copy
 * @function
 */

/**
 * The length in bytes. This property is writable. Setting it to a value higher
 * than the current value fills the new slots with 0, setting it to a lower value
 * truncates the byte array.
 * @type Number
 * @name ByteArray.prototype.length
 */

/**
 * Returns a new ByteArray containing a portion of this ByteArray.
 * @param {Number} begin Zero-based index at which to begin extraction.
 *       As a negative index, begin indicates an offset from the end of the sequence.
 * @param {Number} end  Zero-based index at which to end extraction.
 *       slice extracts up to but not including end.
 *       As a negative index, end indicates an offset from the end of the sequence.
 *       If end is omitted, slice extracts to the end of the sequence.
 * @returns {ByteArray} a new ByteArray
 * @name ByteArray.prototype.slice
 * @function
 */

/**
 * Returns a ByteArray composed of itself concatenated with the given
 * ByteString, ByteArray, and Array values.
 * @param {Binary|Array} arg... one or more elements to concatenate
 * @returns {ByteArray} a new ByteArray 
 * @name ByteArray.prototype.concat
 * @function
 */

/**
 * @name ByteArray.prototype.toByteArray
 * @function
 */

/**
 * @name ByteArray.prototype.toByteString
 * @function
 */

/**
 * Returns an array containing the bytes as numbers.
 * @name ByteArray.prototype.toArray
 * @function
 */

/**
 * Returns a String representation of the ByteArray.
 * @name ByteArray.prototype.toString
 * @function
 */

/**
 * Returns the ByteArray decoded to a String using the given encoding
 * @param {String} encoding the name of the encoding to use
 * @name ByteArray.prototype.decodeToString
 * @function
 */

/**
 * Returns the index of the first occurance of sequnce (a Number or a ByteString or ByteArray of any length)
 * or -1 if none was found. If start and/or stop are specified, only elements between the the indexes start
 * and stop are searched.
 * @param {Number|Binary} sequence the number or binary to look for
 * @param {Number} start optional index position at which to start searching
 * @param {Number} stop optional index position at which to stop searching
 * @returns {Number} the index of the first occurrence of sequence, or -1
 * @name ByteArray.prototype.indexOf
 * @function
 */

/**
 * Returns the index of the last occurance of sequnce (a Number or a ByteString or ByteArray of any length)
 * or -1 if none was found. If start and/or stop are specified, only elements between the the indexes start
 * and stop are searched.
 * @param {Number|Binary} sequence the number or binary to look for
 * @param {Number} start optional index position at which to start searching
 * @param {Number} stop optional index position at which to stop searching
 * @returns {Number} the index of the last occurrence of sequence, or -1
 * @name ByteArray.prototype.lastIndexOf
 * @function
 */

/**
 * Split at delimiter, which can by a Number, a ByteString, a ByteArray or an Array of the prior
 * (containing multiple delimiters, i.e., "split at any of these delimiters").
 * Delimiters can have arbitrary size.
 * @param {Number|Binary} delimiter one or more delimiter items
 * @param {Object} options optional object parameter with the following optional properties:
 * <ul><li>count - Maximum number of elements (ignoring delimiters) to return.
 * The last returned element may contain delimiters.</li>
 * <li>includeDelimiter - Whether the delimiter should be included in the result.</li></ul>  
 * @name ByteArray.prototype.split
 * @function
 */

