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
    JsInject.ERROR_REGISTRATION = 'Already registered ';
    JsInject.ERROR_ARRAY = 'Must pass array.';
    JsInject.ERROR_FUNCTION = 'Must pass function to invoke.';
    JsInject.ERROR_SERVICE = 'Service does not exist.';

    JsInject.prototype.get = function(name, selector) {
        var wrapper = this.container[name];      
        if (wrapper) {
            if (wrapper instanceof JsMultiInject)
            {
                if (selector) {
                    return wrapper.getItem(selector);
                }
                else {                
                  return wrapper.getDictionary();
                }
            }   
                        
            if (!selector) {
                return wrapper();                
            }
            else {
                throw JsInject.ERROR_SERVICE;                
            }
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

    JsInject.prototype.register = function (name, annotatedArray, selector) {
        if (!isArray(annotatedArray)) {
            throw JsInject.ERROR_ARRAY;
        }
        
        var registered = this.container[name];
        if (registered) {
            if (selector && (registered instanceof JsMultiInject)) {
                  if (registered.getWrapper(selector)) {
                      throw JsInject.ERROR_REGISTRATION + name + '[' + selector + ']';                      
                  }              
            }
            else {
                throw JsInject.ERROR_REGISTRATION + name;
            }
        }

        if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
            throw JsInject.ERROR_FUNCTION;
        }

        var _this = this;
        var wrapper = function () {
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
            var cached = function () {
                return result;
            };
                        
            if (selector) {
                _this.container[name].setWrapper(selector, cached);              
            }
            else {
                _this.container[name] = cached;
            }
                        
            return result;
        };
        
        if (selector) {
            if (!registered) {               
                registered = new JsMultiInject();
            }
            
            registered.setWrapper(selector, wrapper);  
            this.container[name] = registered;
        }
        else {
            this.container[name] = wrapper;            
        }
    };
    
    function JsMultiInject() {
        this.wrappers = {};
    }   
    
    JsMultiInject.prototype.getItem = function(name) {
        return this.getWrapper(name)();                    
    };   
    
    JsMultiInject.prototype.getWrapper = function(name) {
        return this.wrappers[name];                    
    };
    
    JsMultiInject.prototype.setWrapper = function(name, wrapper) {
        this.wrappers[name] = wrapper;
        this.dictionary = null;
    };      
       
    JsMultiInject.prototype.getDictionary = function() {
        if (this.dictionary == null) {
            var result = {};
            Object.keys(this.wrappers).forEach(function(key){ result[key] = this.getItem(key); }.bind(this));
            this.dictionary = result;            
        }
        
        return this.dictionary;                            
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