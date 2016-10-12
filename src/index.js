var _      = require("lodash"),
    assert = require("assert-plus");

var RequestMiddlewareFramework = function(request) {
  if (!(this instanceof RequestMiddlewareFramework)) {
    return new RequestMiddlewareFramework(request);
  }

  assert.func(request, "request");
  this.request = request;

  this.initialMiddleware = function(options, callback) {
    return request(options.uri, options, callback);
  };

  this.middleware = [ ];

  if (arguments.length > 1) {
    var args = _.toArray(arguments);
    args.shift();
    _.forEach(args, mw => this.use(mw));
  }
};

RequestMiddlewareFramework.prototype.use = function(middleware) {
  this.middleware = _.concat(this.middleware, middleware);
};

RequestMiddlewareFramework.prototype.getMiddlewareEnabledRequest = function() {
  var me = this;
  var intercept = function(options, callback) {
    var requester;
    var middleware = _.concat(me.middleware, me.initialMiddleware);
    var next = function(_options, _callback) {
      var nextMiddleware = middleware.shift();
      var result = nextMiddleware(_options, _callback, next);
      if (nextMiddleware === me.initialMiddleware) {
        requester = result;
      }
    };
    next(options, callback);
    return requester;
  };
  return me.request.defaults(intercept);
};

module.exports = RequestMiddlewareFramework;
