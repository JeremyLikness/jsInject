// Super-simple dependency injection for JavaScript. 
// Supports n-depth of dependencies and tracks recursion 

var $$jsInject = (function (ioc) {

    var maxRecursion = 20,
        errorRecursion = "Maximum recursion at ",
        errorArray = "Must pass array.",
        errorRegistration = "Already registered.",
        errorFunction = "Must pass function to invoke.",
        errorService = "Service does not exist.",
        container = {
            $$jsInject: function () {
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
                throw errorRecursion + lvl;
            }
            for (; i < deps.length; i += 1) {
                args.push(get(deps[i], lvl + 1));
            }
            return fn.apply(instance, args);
        };

    function register(name, annotatedArray) {
        if (!isArray(annotatedArray)) {
            throw errorArray;
        }
        if (container[name]) {
            throw errorRegistration;
        }
        if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
                throw errorFunction;
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
        throw errorService;
    }

    ioc.register = register;
    ioc.get = get;

    ioc.ERROR_ARRAY = errorArray;
    ioc.ERROR_RECURSION = errorRecursion + (maxRecursion + 1);
    ioc.ERROR_FUNCTION = errorFunction;
    ioc.ERROR_REGISTRATION = errorRegistration;
    ioc.ERROR_SERVICE = errorService;

    return ioc; 
    
})($$jsInject || ($$jsInject = {}));