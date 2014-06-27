'use strict';

(function (w) {

    var constants = {
        maxRecursion: 20,
        errorRecursion: 'Maximum recursion at ',
        errorArray: 'Must pass array.',
        errorRegistration: 'Already registered.',
        errorFunction: 'Must pass function to invoke.',
        errorService: 'Service does not exist.'
        }, isArray = function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
        };

    function JsInject () {
        this.container = {};
    }

    JsInject.prototype.get = function (name, level) {
        var wrapper = this.container[name],
            lvl = level || 0;
        if (wrapper) {
            return wrapper(lvl);
        }
        throw constants.errorService;
    };

    JsInject.prototype.invoke = function (fn, deps, instance, level) {
        var i = 0,
            args = [],
            lvl = level || 0;
        if (lvl > constants.maxRecursion) {
            throw constants.errorRecursion + lvl;
        }
        for (; i < deps.length; i += 1) {
            args.push(this.get(deps[i], lvl + 1));
        }
        return fn.apply(instance, args);
    };

    JsInject.prototype.register = function (name, annotatedArray) {
        if (!isArray(annotatedArray)) {
            throw constants.errorArray;
        }

        if (this.container[name]) {
            throw constants.errorRegistration;
        }

        if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
            throw constants.errorFunction;
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