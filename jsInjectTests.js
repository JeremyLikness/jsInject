describe("jsInject Inversion of Control", function () {

    var empty = function() {};

    it("Given ioc when $$jsInject requested then returns self.", function () {
        var expected = $$jsInject;
        var actual = $$jsInject.get('$$jsInject');
        expect(actual).toBe(expected);
    });

    describe("First-time registration", function() {

        it("Given self-invoking constructor function when registered then registers successfully", function() {

            var fn = (function() {
                function Fn() {}
                Fn.prototype.test = "1";
                return Fn;
            })();

            $$jsInject.register("1", [fn]);
            var actual = $$jsInject.get("1");
            expect(actual.test).toBe("1");
        });

        it("Given function constructor when registered then registers successfully", function() {

            function Fn() {
                this.test = "2";
            }

            $$jsInject.register("2", [Fn]);
            var actual = $$jsInject.get("2");
            expect(actual.test).toBe("2");
        });

        it("Given function factory method when registered then registers successfully", function() {

            var factory = function() {
                return {
                    test: "3"
                };
            };

            $$jsInject.register("3", [factory]);
            var actual = $$jsInject.get("3");
            expect(actual.test).toBe("3");
        });

    });

    describe("Validity checks and contracts", function() {

        it("Given something other than an array passed then it throws an error", function() {
            expect(function() {
                $$jsInject.register("4", "4");
            }).toThrow($$jsInject.ERROR_ARRAY);
        });

        it("Given lst item in array passed is not a function then it throws an error", function() {
            expect(function() {
                $$jsInject.register("4", ["4"]);
            }).toThrow($$jsInject.ERROR_FUNCTION);
        });

        it("Given a registration already exists when duplicate registration is attempted then it throws an error", function()
        {
            expect(function() {
                $$jsInject.register("3", [empty]);
            }).toThrow($$jsInject.ERROR_REGISTRATION);
        });

        it("Given recursive dependencies when a dependency is requested then it throws an error", function () {

            $$jsInject.register("depA", ["depB", empty]);
            $$jsInject.register("depB", ["depA", empty]);

            expect(function () {
                var depA = $$jsInject.get("depA");
            }).toThrow($$jsInject.ERROR_RECURSION);
        });

        it("Given get request on service that does not exist then it throws an error", function () {
           expect(function () {
               var nothing = $$jsInject.get("nothing");
           }).toThrow($$jsInject.ERROR_SERVICE);
        });

    });

    describe("Run-time annotations", function(){

        function serviceA() {
            return {
                id: "a"
            };
        }

        function serviceB(serviceA) {
            return {
                id: serviceA.id + "b"
            };
        }

        function serviceC(serviceA, serviceB) {
            return {
                id: serviceA.id + serviceB.id + "b"
            };
        }

        $$jsInject.register("serviceA", [serviceA]);
        $$jsInject.register("serviceB", ["serviceA", serviceB]);
        $$jsInject.register("serviceC", ["serviceA", serviceC]);

        it ("Given registration with proper annotation then returns properly configured instance", function() {
            var expected = "ab";
            var actual = $$jsInject.get("serviceB").id;
            expect(actual).toBe(expected);
        });

        it ("Given registration with improper annotation then throws exception due to bad reference", function() {
            expect(function () {
                var c = $$jsInject.get("serviceC");
            }).toThrow();
        });
    });

    describe("Object annotations", function(){

        function ServiceA() {
            this.id = "a";
        }

        function ServiceB(serviceA) {
            this.id = serviceA.id + "b";
        }

        ServiceB.$$deps = ["ServiceA"];

        function ServiceC(serviceA, serviceB) {
            this.id = serviceA.id + serviceB.id + "b";
        }

        ServiceC.$$deps = ["ServiceA"];

        $$jsInject.register("ServiceA", [ServiceA]);
        $$jsInject.register("ServiceB", [ServiceB]);
        $$jsInject.register("ServiceC", [ServiceC]);

        it ("Given registration with properly annotated function then returns properly configured instance", function() {
            var expected = "ab";
            var actual = $$jsInject.get("ServiceB").id;
            expect(actual).toBe(expected);
        });

        it ("Given registration with improperly annotated function then throws exception due to bad reference", function() {
            expect(function () {
                var c = $$jsInject.get("ServiceC");
            }).toThrow();
        });
    });
});