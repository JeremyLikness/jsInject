var WintellectJs;
(function (WintellectJs) {

    'use strict';

    var $$jsInject = (function () {
        function $$jsInject() {
            var _this = this;
            this.maxRecursion = 20;
            this.errorRecursion = "Maximum recursion at ";
            this.errorArray = "Must pass array.";
            this.errorRegistration = "Already registered.";
            this.errorFunction = "Must pass function to invoke.";
            this.errorService = "Service does not exist.";
            this.container = {
                "$$jsInject": function () {
                    return _this;
                }
            };
            this.isArray = function (arr) {
                return Object.prototype.toString.call(arr) === '[object Array]';
            };
            this.invoke = function (fn, deps, instance, level) {
                var i = 0,
                    args = [],
                    lvl = level || 0;
                if (lvl > _this.maxRecursion) {
                    throw _this.errorRecursion + lvl;
                }
                for (; i < deps.length; i += 1) {
                    args.push(_this.get(deps[i], lvl + 1));
                }
                return fn.apply(instance, args);
            };
            this.get = function (name, level) {
                var wrapper = _this.container[name],
                    lvl = level || 0;
                if (wrapper) {
                    return wrapper(lvl);
                }
                throw _this.errorService;
            };
            this.register = function (name, annotatedArray) {
                if (!_this.isArray(annotatedArray)) {
                    throw _this.errorArray;
                }
                if (_this.container[name]) {
                    throw _this.errorRegistration;
                }
                if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
                    throw _this.errorFunction;
                }
                _this.container[name] = function (level) {
                    var lvl = level || 0,
                        Template = function () {}, result = {}, instance, fn = annotatedArray[annotatedArray.length - 1],
                        deps = annotatedArray.length === 1 ? (annotatedArray[0].$$deps || []) : annotatedArray.slice(0, annotatedArray.length - 1),
                        injected;
                    Template.prototype = fn.prototype;
                    instance = new Template();
                    injected = _this.invoke(fn, deps, instance, lvl + 1);
                    result = injected || instance;

                    // don't evaluate again (lazy-load)
                    _this.container[name] = function () {
                        return result;
                    };
                    return result;
                };
            };
        }
        Object.defineProperty($$jsInject.prototype, "ERROR_ARRAY", {
            get: function () {
                return this.errorArray;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty($$jsInject.prototype, "ERROR_RECURSION", {
            get: function () {
                return this.errorRecursion + (this.maxRecursion + 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty($$jsInject.prototype, "ERROR_FUNCTION", {
            get: function () {
                return this.errorFunction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty($$jsInject.prototype, "ERROR_REGISTRATION", {
            get: function () {
                return this.errorRegistration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty($$jsInject.prototype, "ERROR_SERVICE", {
            get: function () {
                return this.errorService;
            },
            enumerable: true,
            configurable: true
        });
        return $$jsInject;
    })();
    WintellectJs.$$jsInject = $$jsInject;
})(WintellectJs || (WintellectJs = {}));