var AWS = AWS || {};

//----------------------------------------------------------------------
//  Backbone version of AWS models
//----------------------------------------------------------------------

// For CORS access, server response needs this header:
//  Access-Control-Allow-Origin: http://mywebappserver.com

/**
 * Each model must supply listName and idAttribute (primaryKey) for the default
 * SDKinator mechanisms to work.
 */
AWS.Model = Backbone.Model.extend(
{
    //----------------------------------------------------------------------
    // Each model must supply these for the default mecahnisms to work
    //----------------------------------------------------------------------
    listName: "",     // the name of the json array returned, ex: "instances"
    idAttribute: "",  // primary key of the json objects, ex: "instanceId"

    server: AWS.server,
    errorMessage: undefined,  // ?

    // this is not called unless children call it with
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

        $.ajaxSetup(
            {
                dataType: 'json',
                context: this,
                success: this.handleLoadResponse,
                error: this.handleError,

                // set up cross domain (CORS) flags
                // crossDomain: true,
                // xhrFields: { withCredentials: true },  // pass cookies

                timeout: 10000   // don't run success CB after 10s passed
            });
    },

    // error check before we look at data
    // if something is bad here an "error" event will be triggered later
    // should we short circuit instead?  TODO
    beforeParse: function( response, xhr ) {
        this.errorMessage = AWS.util.parseErrors( response, xhr );
    },

    /**
     * Called for Model.sync/fetch(), expects only a single object, so
     * return only the first element of the array AWS probably handed us. 
     */
    parse: function( response, xhr ) {
        this.beforeParse( response, xhr );

        // if this is an unmassaged response from AWS
        if (response) {
            var modelList =  response[this.model.prototype.listName];
            if (modelList.length === 1) {
                return modelList[0];
            }
        }
        // hope this is a pure object already (ex: collection.add)
        return response;
    },

    // ajax error handler, not error trigger
    // TODO: parseError message here also. 
    handleError: function( model, resp, xhrOptions ) {
        // broken?
        this.errorMessage = this.errorMessage ||
            "Failed to load " + xhrOptions.url;
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
    beforeParse: function( response, xhr ) {
        // check for errors first
        this.errorMessage = AWS.parseErrors( response, xhr );
    },

    // This is called on set() (from fetch/sync, etc).
    // Massage any ajax data into a backbone friendly array of json.
    // ex: { instances: [ ... ] } ==>  [ inst1, inst2, inst3 ]
    // if not an array, don't bother
    parse: function( response, xhr ) {

        this.beforeParse( response, xhr );

        response = response || {};

        // do I need to call parse on each element of the response array too?
        // TODO
        return response[this.model.prototype.listName];
    },

    // override with jsonp getter
    // if this is called from fetch, then built-in success/done() should
    // call model.set() on the result
    sync: function(method, model, options) {
        // we only support method="read"

        options = options || {};
        options.context = this;
        options.dataType = 'jsonp';   // "&callback=?" is added to url for jsonp

        options.url = AWS.urlRoot + this.model.prototype.urls.list;

        // unnecessary, "reset" or "change" called by default
        // success: this.handleLoadResponse,

        // potentially unnecessary, "error" event fired by default
        // error: this.handleError

        Backbone.sync("read", model, options );

        // backbone.sync( method, model, options );
        // $.ajax( options ).done( this.handleLoadResponse )
        //     .fail( this.handleError );
        //     .always( function() { alert("complete"); });
    }

}
);
