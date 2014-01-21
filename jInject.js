// Super-simple dependency injection for JavaScript. 
// Supports n-depth of dependencies and tracks recursion 

var $$jInject = (function (ioc) {

    var maxRecursion = 20,
        container = {
            $$ioc: function () {
                return ioc;
            }
        },
        isArray = function(arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        },
        invoke = function (fn, deps, instance, level) {
            var i = 0,
                args = [],
                lvl = level || 0;
            if (lvl > maxRecursion) {
                throw "Maximum recursion at " + lvl;
            }
            for (; i < deps.length; i += 1) {
                args.push(get(deps[i], lvl + 1));
            }
            return fn.apply(instance, args);
        };

    function register(name, annotatedArray) {
        if (!isArray(annotatedArray)) {
            throw "Must pass array.";
        }
        if (container[name]) {
            throw "Already registered.";
        }
        if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
                throw "Must pass function to invoke.";
        }            
        container[name] = function (level) {
            var lvl = level || 0,
                Template = function () {},
                result = {},
                instance,
                fn = annotatedArray[annotatedArray.length - 1],
                deps = annotatedArray.length === 1 ? (annotatedArray[0].$$deps || []) : annotatedArray.slice(0, annotatedArray.length - 1),
                injected;
            Template.prototype = fn.prototype;
            instance = new Template();
            injected = invoke(fn, deps, instance, lvl + 1);
            result = injected || instance;
            // don't evaluate again (lazy-load) 
            container[name] = function () {
                return result;
            };
            return result;
        };
    }

    function get(name, level) {
        var wrapper = container[name],
            lvl = level || 0;
        if (wrapper) {
            return wrapper(lvl);
        }
        throw "Service does not exist.";
    }

    ioc.register = register;
    ioc.get = get;    
    
    return ioc; 
    
})($$jInject || ($$jInject = {}));