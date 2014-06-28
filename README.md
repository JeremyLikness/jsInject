jsInject
========

Simple, easy dependency injection framework for JavaScript.

Inspired by the `$injector` service in the Angular framework library, I built this from scratch as a standalone experiment in dependency injection for JavaScript. 

It handles nested dependencies, avoids infinite recursion, takes multiple patterns for object creation, and uses annotations for dependencies that are
minification-friendly. You may either set an array on the object to indicate the list of dependencies to inject into the constructor or specify the dependencies
when you add the object to the container.

Learn more about jsInject in [this blog post](http://csharperimage.jeremylikness.com/2014/06/dependency-injection-explained-via.html).

Create an instance of the container (you may have as many containers as you like, but they are not aware of each other): 

    var $jsInject = new $$jsInject();

`$$jsInject` can handle multiple patterns for object creation: 

**Factory**

    function serviceA(dependencyB) {
        return {
          id: dependencyB.getId()
        };
    }

**Constructor Function** 

    function ServiceA(dependencyB) {
        this.id = dependencyB.getId();
    }

**Self-Invoking Function** 

    var ServiceA = (function() {
        function ServiceA(dependencyB) {
            this.id = dependencyB.getId();
        }
        return ServiceA;
    })();

**Function Annotation:**

    ServiceA.$$deps = ["dependencyB"]; 
    $jsInject.register("serviceA", [ServiceA]);

**Registration-time Annotation** 

    $jsInject.register("serviceA", ["dependencyB", ServiceA]);
    
**Retrieving instances** 
    
    var svcA = $jsInject.get("serviceA");
    var depB = $jsInject.get("dependencyB");

Pass a unique name for the instance to the registration function, then an array. The array should either contain the function if the function itself is annotated
with the special property `$$deps`, or a list of named dependencies followed by the function in an array if you want to annotate the dependencies at run-time.

See the tests to learn more. 

http://twitter.com/JeremyLikness

http://csharperimage.jeremylikness.com
