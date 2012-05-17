var AWS = AWS || {};

//----------------------------------------------------------------------
//  Backbone version of AWS models
//----------------------------------------------------------------------

// CORS access, response needs this header:
//  Access-Control-Allow-Origin: http://mywebappserver.com

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

        Backbone.Model.prototype.initialize.call(this, attributes, options);

        // assert idAttribute and listName

        if (!this.idAttribute) {
            throw new Error("No idAttribute specified in Model");
        }
        if (!this.listName) {
            throw new Error("No listName specified in Model");
        }

        //set up cross domain (CORS) flags
        $.ajaxSetup(
            {
                dataType: 'json',
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                context: this,
                success: this.handleLoadResponse,
                error: this.handleError,

                timeout: 10000   // don't run success CB after 10s passed
            });
    },

    // unfortunately with jsonp, the error message needs to be jsonp as well
    // so we can't display raw error results
    handleError: function( model, resp, xhrOptions ) {

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

        options = options || {};
        options.context = this;
        options.dataType = 'jsonp';
        options.url = AWS.urlRoot + this.model.prototype.urls.list;

        // options = $.extend( options,
        //     {
        //         // FIXME - this is ugly, accessor?
        //         url: AWS.urlRoot + this.model.prototype.urls.list,
        //         dataType: 'jsonp', // "&callback=?" is added if dataType='jsonp'
        //         context: this

        //         // data: options,  // what about instanceId=?

        //         // unnecessary, "reset" called by default
        //         // success: this.handleLoadResponse,

        //         // potentially unnecessary, "error" event fired by default
        //         // error: this.handleError

        //     } );

        Backbone.sync("read", model, options );

        // backbone.sync( method, model, options );
        // $.ajax( options ).done( this.handleLoadResponse )
        //     .fail( this.handleError );
        //     .always( function() { alert("complete"); });
    }

}
);
