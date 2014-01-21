jsInject
========

Simple, easy dependency injection framework for JavaScript.

Inspired by the $injector provided in the Angular framework library, I built this from scratch as a standalone experiment in dependency injection for JavaScript. 

It can handle multiple patterns for object creation: 

Factory

function serviceA(dependencyB) {
  return {
    id: dependencyB.getId()
  };
}

Constructor Function 

function ServiceA(dependencyB) {
  this.id = dependencyB.getId();
}

Self-Invoking Function 

var ServiceA = (function(dependencyB) {
  function ServiceA() {}
  ServiceA.prototype.id = dependencyB.getId();
  return ServiceA;
})();

Supports function annotation: 

ServiceA.$$deps = ["dependencyB"]; 
$$jsInject.register("serviceA", [ServiceA]); 

Or annotation at registration-time: 

$$jsInject.register("serviceA", ["dependencyB", ServiceA]); 

Pass a unique name for the instance to the registration function, then an array. The array should either contain the function if the funtion itself is annoted to $$deps, or a list of named dependencies followed by the function in an array if you want to annotate the dependencies at run-time. 

See the tests to learn more. 

@JeremyLikness
http://csharperimage.jeremylikness.com
