// wrap in a protective layer of closurey goodness to protect $ and global
// should this wrap at a more global level?  TODO
// (function awsModelDefinition_(global,$) {
// var AWS = global.AWS = global.AWS || {};

var AWS = AWS || {};

//----------------------------------------------------------------------
//---------------------------------------------------------------------- 
//  Backbone version of AWS models
//----------------------------------------------------------------------
//----------------------------------------------------------------------

/**
 * Each model must supply listName and idAttribute (primaryKey) for the default
 * SDKinator mechanisms to work.

 * Backbone steals the ajax success/error callbacks so we rely on the
 * BB event model to handle everything.  By attaching in ctor we are the first
 * error handlers.
 * This way we don't need xhr.done() and xhr.error() either.
 */
AWS.Model = Backbone.Model.extend(
{
    //----------------------------------------------------------------------
    // Each model must supply these for the default mecahnisms to work
    //----------------------------------------------------------------------
    listName: "",     // the name of the json array returned, ex: "instances"
    idAttribute: "",  // primary key of the json objects, ex: "instanceId"

    server: AWS.server,
    errorMessage: undefined,  // set when ajax fails

    // this is not called unless children call it with
    // AWS.Model.prototype.initialize.call(this, attributes, options);
    initialize: function( attributes, options ) {

        Backbone.Model.prototype.initialize.apply( this, arguments );

        // assert idAttribute and listName
        if (!this.idAttribute) {
            throw new Error("No idAttribute specified in Model");
        }
        if (!this.listName) {
            throw new Error("No listName specified in Model");
        }

        // put ajax-y handlers here because BB steals success and error handlers
        // these will occur before xhr.done() and xhr.error()
        // These will happen first, even before xhr.done() and xhr.error()
        this.on("change", this.handleLoadResponse );
        this.on("error", this.handleError );
    },

    getXHROptions: function() {
        return {
            context: this
        };
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

        // if this is an unmassaged response from AWS, dereference it
        if (response) {
            var modelList =  response[this.model.prototype.listName];
            if (modelList.length === 1) {
                return modelList[0];
            }
        }
        // hope this is a pure object already (ex: collection.add)
        return response;
    },

    // merge in properly jsonified args param to ajax request
    // ex: args = { instanceIds: ["i-1234"] };
    addRequestArgs: function( options, args ) {
        options = options || {};
        options.data = options.data || {};
        $.extend( options.data, 
                  { args: JSON.stringify( args ) });
        return options;
    },

    // get data for a single instance, same as Colection.sync (plus args)
    // presumes that children will call the appropriate addRequestArgs()
    // ex: addRequestArgs( { instanceIds: [this.get("instanceId")] } );
    sync: function(method, model, options) {

        var xhrOptions = AWS.util.setupAjax();

        // merge global defaults, model defaults, and overrides
        $.extend( xhrOptions, this.getXHROptions(), options );

        xhrOptions.url = AWS.urlRoot + this.urls.list;

        return Backbone.sync("read", model, xhrOptions );
    },


    // But what about beforeParse?  Will it get called on a 400 so we can read
    // error: []?
    // TEST 400
    // TODO: probably need to parseError message here also.

    // NOTE: in jsonp, an auth failure results in a non-jsonp response
    // so the status=0 and the resp="error" with no other details.
     
    // error event handler, not ajax error handler, BB swallows that
    handleError: function( model, resp, xhrOptions ) {
        this.errorMessage = this.errorMessage ||
            "Failed to load " + xhrOptions.url + 
            ", code: " + resp.status+  ", status: " + resp.statusText;

        alert("dammit model: " + this.errorMessage );
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
                   url: url,
                   data: args,
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

        // put ajax-y handlers here because BB steals 
        // xhr.success and xhr.error handlers.
        // These will happen first, even before xhr.done() and xhr.error()
        this.on("reset", this.handleLoadResponse );
        this.on("error", this.handleError );
    },

    // This is called on set() (from fetch/sync, etc).
    // Massage any ajax data into a backbone friendly array of json.
    // ex: { instances: [ ... ] } ==>  [ inst1, inst2, inst3 ]
    // if not an array, don't bother
    parse: function( response, xhr ) {
        this.beforeParse( response, xhr );

        response = response || {};

        // AWS will give us this: { instances: [ ... ] }
        // return just the array part
        if (response[this.model.prototype.listName]) {
            return response[this.model.prototype.listName];
        }
        
        // hope this is a pure object already (ex: ctor)   
        return response;
    },


    getXHROptions: function() {
        return this.model.prototype.getXHROptions.apply( this, arguments );
    },
    beforeParse: function( response, xhr ) {
        return this.model.prototype.beforeParse.apply( this, arguments );
    },
    addRequestArgs: function( options, args ) {
        return this.model.prototype.addRequestArgs.apply( this, arguments );
    },
    // calls model.set() on the result, "reset" event fired when this is done
    sync: function(method, model, options)  {

        var xhrOptions = AWS.util.setupAjax();

        // merget global defaults, model defaults, and overrides
        $.extend( xhrOptions, this.getXHROptions(), options );

        // can't call Model as "this" since urls is not a member of collection
        // FIXME
        xhrOptions.url = AWS.urlRoot + this.model.prototype.urls.list;

        return Backbone.sync("read", model, xhrOptions );
    },
    handleError: function( model, resp, xhrOptions ) { 
        return this.model.prototype.handleError.apply( this, arguments );
    }

}
);



// end of closure
// })(this, jQuery||{} );
