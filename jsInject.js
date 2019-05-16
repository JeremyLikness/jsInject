'use strict';

(function (w) {

    var stack = {},
        isArray = function (arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        };

    function JsInject () {
        this.container = {};
    }

    JsInject.ERROR_RECURSION = 'Recursive failure : Circular reference for dependency ';
    JsInject.ERROR_REGISTRATION = 'Already registered.';
    JsInject.ERROR_ARRAY = 'Must pass array.';
    JsInject.ERROR_FUNCTION = 'Must pass function to invoke.';
    JsInject.ERROR_SERVICE = 'Service does not exist.';

    JsInject.prototype.get = function(name) {
        var wrapper = this.container[name];
        if (wrapper) {
            return wrapper();
        }
        throw JsInject.ERROR_SERVICE;
    };

    JsInject.prototype.invoke = function (fn, deps, instance, name) {
        var i = 0,
            args = [];
        if (stack[name]) {
            throw JsInject.ERROR_RECURSION + name + " : " + JSON.stringify(Object.keys(stack));
        }
        
        stack[name] = instance; 
        for (; i < deps.length; i += 1) {
            args.push(this.get(deps[i]));
        }
        delete stack[name];
        
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
        this.container[name] = function () {
            var Template = function () {},
                result = {},
                instance,
                fn = annotatedArray[annotatedArray.length - 1],
                deps = annotatedArray.length === 1 ? (annotatedArray[0].$$deps || []) :
                    annotatedArray.slice(0, annotatedArray.length - 1),
                injected;
            Template.prototype = fn.prototype;
            instance = new Template();
            injected = _this.invoke(fn, deps, instance, name);
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