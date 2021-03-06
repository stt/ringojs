
include('ringo/webapp/util');
include('io');
include("binary");

export('handleRequest');
var log = require('ringo/logging').getLogger(module.id);
module.shared = true;

/**
 * Handle a JSGI request.
 * @param moduleId the module id. Ignored if functionObj is already a function.
 * @param functionObj the function, either as function object or function name to be
 *             imported from the module moduleId.
 * @param env the JSGI env object
 * @returns the JSGI response object
 */
function handleRequest(moduleId, functionObj, env) {
    initRequest(env);
    var app;
    if (typeof(functionObj) == 'function') {
        app = functionObj;
    } else {
        var module = require(moduleId);
        app = module[functionObj];
        var middleware = module.middleware || [];
        env["ringo.config"] = moduleId;
        app = middleware.reduceRight(middlewareWrapper, resolve(app));
    }
    if (!(typeof(app) == 'function')) {
        throw new Error('No valid JSGI app: ' + app);
    }
    var result = app(env);
    if (!result) {
        throw new Error('No valid JSGI response: ' + result);
    }
    commitResponse(env, result);
}

/**
 * Set up the I/O related properties of a jsgi environment object.
 * @param env a jsgi request object
 */
function initRequest(env) {
    var input, errors;
    if (env.hasOwnProperty('jsgi.input')) {
        // already set up, probably because the original request threw a retry
        return;
    }
    Object.defineProperty(env, "jsgi.input", {
        get: function() {
            if (!input)
                input = new Stream(env['jsgi.servlet_request'].getInputStream());
            return input;
        }
    });
    Object.defineProperty(env, "jsgi.errors", {
        value: system.stderr
    });
}

/**
 * Apply the return value of a JSGI application to a servlet response.
 * This is used internally by the org.ringojs.jsgi.JsgiServlet class, so
 * you won't need this unless you're implementing your own servlet
 * based JSGI connector.
 *
 * @param env the JSGI env argument
 * @param result the object returned by a JSGI application
 */
function commitResponse(env, result) {
    if (typeof result.then === "function") {
        handleAsyncResponse(env, result);
        return;
    }
    var request = env['jsgi.servlet_request'];    
    var response = env['jsgi.servlet_response'];
    var charset;
    if (!result.status || !result.headers || !result.body) {
        throw new Error('No valid JSGI response: ' + result);
    }
    var {status, headers, body} = result;
    response.status = status;
    for (var key in headers) {
        headers[key].split("\n").forEach(function(value) {
            response.addHeader(key, value);
        });
    }
    var charset = getMimeParameter(Headers(headers).get("Content-Type"), "charset");
    writeBody(response, body, charset);
}

function writeBody(response, body, charset) {
    if (body && typeof body.forEach == "function") {
        var output = response.getOutputStream();
        var writer = function(part) {
            if (!(part instanceof Binary)) {
                part = part.toByteString(charset);
            }
            output.write(part);
            output.flush();
        };
        body.forEach(writer);
        if (typeof body.close == "function") {
            body.close(writer);
        }
    } else {
        throw new Error("Response body doesn't implement forEach: " + body);
    }
}

function writeAsync(request, response, result) {
    var charset;
    var part = result.part;
    if (result.first) {
        if (!part.status || !part.headers) {
            throw new Error('No valid JSGI response: ' + result);
        }
        var {status, headers} = part;
        response.status = status;
        for (var name in headers) {
            response.setHeader(name, headers[name]);
        }
        charset = getMimeParameter(Headers(headers).get("Content-Type"), "charset");
    }
    if (part.body) {
        writeBody(response, part.body, charset);
        // this should cause data to be written to the client, doesn't seem to work
        response.flushBuffer();
    }
}

function handleAsyncResponse(env, result) {
    // experimental support for asynchronous JSGI based on Jetty continuations
    var ContinuationSupport = org.eclipse.jetty.continuation.ContinuationSupport;
    var request = env['jsgi.servlet_request'];
    var response = env['jsgi.servlet_response'];
    //var queue = new java.util.concurrent.ConcurrentLinkedQueue();
    //request.setAttribute('_ringo_response', queue);
    var continuation = ContinuationSupport.getContinuation(request);
    var first = true, handled = false;
    
    var onFinish = function(part) {
        if (handled) return;
        log.debug("JSGI async finish called with: " + part);
        var res = {
            first: first,
            last: true,
            part: part
        };
        handled = true;
        //queue.offer(res);
        writeAsync(request, response, res);
        continuation.complete();
    };
    var onError = function(error) {
        if (handled) return;
        log.error("JSGI async error: " + error);
        if (first) {
            commitResponse(env, {
                status: 500,
                headers: {"Content-Type": "text/html"},
                body: ["<!DOCTYPE html><html><body><h1>Error</h1>", error.toString(), "</body></html>"]
            })
        }
        handled = true;
    };
    var onProgress = function(part) {
        log.debug('JSGI async progress called with: ' + part);
        if (handled) return;
        var res = {
            first: first,
            part: part
        };
        first = false;
        //queue.offer(res);
        writeAsync(request, response, res);
        // continuation.suspend();
    };
    log.debug('handling JSGI async response, calling then');
    // TODO sync callbacks on queue once rhino supports this (bug 513682)
    result.then(onFinish, onError, onProgress);
    if (!handled) {
        continuation.setTimeout(12000);
        continuation.suspend();
    }
}

/**
 * Convenience function that resolves a module id or object to a
 * JSGI middleware or application function. This assumes the function is
 * exported as "middleware" or "handleRequest".
 * @param module a function, module object, or moudule id
 */
function resolve(module) {
    if (typeof module == 'string') {
        module = require(module);
        return module.middleware || module.handleRequest;
    }
    return module;
}

/**
 * Helper function for wrapping middleware stacks
 * @param inner an app or middleware module or function wrapped by outer
 * @param outer a middleware module or function wrapping inner
 */
function middlewareWrapper(inner, outer) {
    return resolve(outer)(inner);
}
