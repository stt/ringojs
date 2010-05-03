require('core/string');

export('middleware');

// instead of core.string.debase64 for appengine
function base64decode(str) {
   return new java.lang.String(com.google.appengine.repackaged.com.google.common.util.Base64.decode(str));
}

function isGAE() {
   try {
      com.google.appengine.api.datastore.DatastoreServiceFactory.getDatastoreService();
      return true;
   } catch(e) {
      return false;
   }
}

/**
 * In config.js you would need for example:
 * exports.auth = { '/adm/' : {'admin':'54ef36ec71201fdf9d1423fd26f97f6b','user2':'..'} };
 */
function middleware(app) {
   return function(env) {
      var authz = require('config').auth;
      for(var key in authz) {
         var re = new RegExp(key);
         if(re.test(env.PATH_INFO)) {
            var msg = '401 Unauthorized';
            if(env.HTTP_AUTHORIZATION) {
               var authreq = env.HTTP_AUTHORIZATION.replace(/Basic /,'');
               var httpuser = (isGAE() ? base64decode(authreq) : authreq.debase64()).split(':');
               var pwd = authz[key][ httpuser[0] ];
               if(httpuser[1].digest() == pwd)
                  return app(env);
            }

            return {
               status: 401,
               headers: {
                 'Content-Type': 'text/html',
                 'WWW-Authenticate': 'Basic realm="Secure Area"'
               },
               body: [
                '<html><title>', msg, '</title><body><h2>', msg, '</h2></body></html>'
                  ]
               };
         }
      }
      // allow by default
      return app(env);
   }
}

