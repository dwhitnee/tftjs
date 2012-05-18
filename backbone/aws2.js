//----------------------------------------------------------------------
//  Backbone version of AWS models
//----------------------------------------------------------------------


// wrap in a protective layer of closurey goodness to protect $ and global
// should this wrap at a more global level?  TODO
// (function awsModelDefinition_(global,$) {
// var AWS = global.AWS = global.AWS || {};

var AWS = AWS || {};

/**
  * Each model must supply listName and primaryKey for the default mechanisms
  * to work
  */
AWS.Model = Backbone.Model.extend(
{
    //----------------------------------------------------------------------
    // Each model must supply these for the default mecahnisms to work
    //----------------------------------------------------------------------
    listName: "",     // the name of the json array returned, ex: "instances"
    idAttribute: "",  // primary key of the json objects, ex: "instanceId"

    server: AWS.server,
    errorMessage: undefined,

    // this is not called unless children call it
    // AWS.Model.prototype.initialize.call(this, attributes, options);

    initialize: function( attributes, options ) {

        Backbone.Model.prototype.initialize.apply( this, arguments );

        this.xhrOptions = {
            context: this,
            // success: this.handleLoadResponse,
            error: this.handleError
        };

        // assert idAttribute and listName

        if (!this.idAttribute) {
            throw new Error("No idAttribute specified in Model");
        }
        if (!this.listName) {
            throw new Error("No listName specified in Model");
        }
    },

    // unfortunately with jsonp, the error message needs to be jsonp as well
    // so we can't display raw error results
    handleError: function( model, resp, xhrOptions ) {

        alert("dammit");
        // { "error": ["Please reauth..."] }
        // will cause a parseerror, but backbone swallows it in wrapError
    },

    /**
     *  Make an async call if this.url.method exists
     *  This is not Backbony in the least, but treats a Model as a first class
     *  object, not a row in a DB table.
     *  Perhaps this should be factored out of backbone-ish stuff. mixin? TODO
     *
     *  @param method Ex: "terminate"
     *           assumes this.url.terminate="/ec2/terminateInstance"
     *  @param args requestParams, ex: { instanceId: "i-1234" }
     */
    executeAsync: function( method, args ) {
        if (!this.url[method]) {
            throw new Error("Unknown method " + method);
        }
        var url = this.server + this.url[method];

        $.ajax({
                   url: url, // adds"&callback=?" if jsonp
                   dataType: 'jsonp',
                   data: args,
                   context: this,
                   success: this.handleExecResponse,
                   error: this.handleError
               }
              );
    }

});


 //----------------------------------------------------------------------
// A Collection of AWS objects, we need to parse the AWS response data into
// a simple array of objects (client-side Nucleo..)
//
// AWS.EC2.Instances = AWS.Model.Collection.extend( ... );
// var instances = new AWS.EC2.Instances();
// instances.on("reset", doSomething )
// instances.on("error", doSomething )
// instances.fetch();
//----------------------------------------------------------------------
AWS.Model.Collection = Backbone.Collection.extend(
{
    initialize: function( models, options ) {
        Backbone.Collection.prototype.initialize.apply( this, arguments );

        this.xhrOptions = {
            context: this,
            // success: this.handleLoadResponse,
            error: this.handleError
        };
    },

    // This is called on set().
    // Massage any ajax data into a backbone friendly layout.
    // turn response into simple array of parsable objects
    // ex: { instances: [ ... ] }
    parse: function( response, xhr ) {
        response = response || {};
        // do I need to call parse on each element of the response array too?
        // TODO
        // ensure listName?  TODO
        return response[this.model.prototype.listName];  // FIXME ugly static
    },

    // override with jsonp getter
    // if this is called from fetch, then built-in success/done() should
    // call model.set() on the result
    sync: function(method, model, options) {
        // we only support method="read"

        var xhrOptions = $.extend( this.xhrOptions, options );

        xhrOptions.url = AWS.urlRoot + this.model.prototype.urls.list;

        Backbone.sync("read", model, xhrOptions );

        // backbone.sync( method, model, options );
        // $.ajax( options ).done( this.handleLoadResponse )
        //     .fail( this.handleError );
        //     .always( function() { alert("complete"); });
    }
});


// end of closure
// })(this, jQuery||{} );
