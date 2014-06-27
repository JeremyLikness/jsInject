'use strict';

(function (w) {

    var maxRecursion = 20,
        isArray = function (arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        };

    function JsInject () {
        this.container = {};
    }

    JsInject.ERROR_RECURSION = 'Maximum recursion at ';
    JsInject.ERROR_REGISTRATION = 'Already registered.';
    JsInject.ERROR_ARRAY = 'Must pass array.';
    JsInject.ERROR_FUNCTION = 'Must pass function to invoke.';
    JsInject.ERROR_SERVICE = 'Service does not exist.';

    JsInject.prototype.get = function (name, level) {
        var wrapper = this.container[name],
            lvl = level || 0;
        if (wrapper) {
            return wrapper(lvl);
        }
        throw JsInject.ERROR_SERVICE;
    };

    JsInject.prototype.invoke = function (fn, deps, instance, level) {
        var i = 0,
            args = [],
            lvl = level || 0;
        if (lvl > maxRecursion) {
            throw JsInject.ERROR_RECURSION + lvl;
        }
        for (; i < deps.length; i += 1) {
            args.push(this.get(deps[i], lvl + 1));
        }
        return fn.apply(instance, args);
    };

    JsInject.prototype.register = function (name, annotatedArray) {
        if (!isArray(annotatedArray)) {
            throw JsInject.ERROR_ARRAY;
        }

        if (this.container[name]) {
            throw JsInject.ERROR_REGISTRATION;
        }

        if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
            throw JsInject.ERROR_FUNCTION;
        }

        var _this = this;
        this.container[name] = function (level) {
            var lvl = level || 0,
                Template = function () {},
                result = {},
                instance,
                fn = annotatedArray[annotatedArray.length - 1],
                deps = annotatedArray.length === 1 ? (annotatedArray[0].$$deps || []) :
                    annotatedArray.slice(0, annotatedArray.length - 1),
                injected;
            Template.prototype = fn.prototype;
            instance = new Template();
            injected = _this.invoke(fn, deps, instance, lvl + 1);
            result = injected || instance;
            _this.container[name] = function () {
                return result;
            };
            return result;
        };
    };

    function Wrapper() {
        var ioc = new JsInject(), _that = this;
        this.get = ioc.get.bind(ioc);
        this.register = ioc.register.bind(ioc);
        ioc.container['$$jsInject'] = function () {
            return _that;
        };
    }

    w.$$jsInject = Wrapper;
})(window);