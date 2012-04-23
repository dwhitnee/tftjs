//----------------------------------------------------------------------
//  Take all arguments and place them in the new class's prototype
//
// Is this correct?
//
//   DefineClass is a function that returns a constructor function.
// The constructor function calls initialize() with its arguments.

// The parameters to DefineClass have their prototypes or themselves
// merged with the constructor function's prototype.

// Finally, the constructor function's prototype is merged with the constructor
// function. So you can write Shape.getArea.call(this) instead of
// Shape.prototype.getArea.call(this).
//----------------------------------------------------------------------
var DefineClass = function() {

    // Constructor just calls init()
    var c = function() {
        this.init.apply( this, arguments );
    };

    c.prototype = {};

    $.each( arguments,
            function( i, arg ) {
                if (arg.prototype) {
                    $.extend( c.prototype, arg.prototype);  // inheritance
                } else {
                    $.extend( c.prototype, arg );  // aggregation
                }
            });

    // allow Foo.Blah.twist() to be called instead of Foo.Blah.protoype.twist()
    // within the class definition.
    $.extend( c, c.prototype );

    return c;
};
