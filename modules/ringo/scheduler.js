/**
 * @fileoverview This module provides support for scheduling invocation of functions.
 */

module.shared = true;

var executor = executor || java.util.concurrent.Executors.newScheduledThreadPool(4);
var MILLIS = java.util.concurrent.TimeUnit.MILLISECONDS;

/**
 * Executes a function after specified delay.
 * @param {function} callback a function
 * @param {number} delay the delay in milliseconds
 * @param [args] optional arguments to pass to the function
 * @returns {object} an id object useful for cancelling the scheduled invocation
 */
exports.setTimeout = function(callback, delay) {
    var args = Array.slice(arguments, 2);
    var runnable = new java.lang.Runnable({
        run: function() {
            callback.apply(global, args);
        }
    });
    delay = parseInt(delay, 10) || 0;
    return executor.schedule(runnable, delay, MILLIS);
};

/**
 * Cancel a timeout previuosly scheduled with setTimeout().
 * @param {object} id the id object returned by setTimeout()
 * @see setTimeout
 */
exports.clearTimeout = function(id) {
    try {
        id.cancel(false);
    } catch (e) {
        // ignore
    }
};

/**
 * Calls a function repeatedly, with a fixed time delay between each call to that function.
 * @param {function} callback a function
 * @param {number} delay the delay in milliseconds
 * @param [args] optional arguments to pass to the function
 * @returns {object} an id object useful for cancelling the scheduled invocation
 */
exports.setInterval = function(callback, delay) {
    var args = Array.slice(arguments, 2);
    var runnable = new java.lang.Runnable({
        run: function() {
            try {
                callback.apply(global, args);
            } catch (e) {
                // ignore
            }
        }
    });
    delay = parseInt(delay, 10) || 0;
    return executor.scheduleAtFixedRate(runnable, 0, delay, MILLIS);
};

/**
 * Cancel a timeout previuosly scheduled with setInterval().
 * @param {object} id the id object returned by setInterval()
 * @see setInterval
 */
exports.clearInterval = function(future) {
    try {
        future.cancel(false);
    } catch (e) {
        // ignore
    }
};
