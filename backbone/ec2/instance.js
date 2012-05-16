var AWS = AWS || {};
AWS.EC2 = AWS.EC2 || {};

//----------------------------------------------------------------------
//  Backbone version of AWS models
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//  AWS services are not particularly RESTful, ie, they don't have a
//  URL that you can PUT and GET against.  They are more SOAPy so this
//  Model class is closer in spirit to the CDK Models.
//  You can get a list, and make method calls using the Model
//  (ex: instance.stop() )
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
    listName: "",    // the name of the json array returned, ex: "instances"
    primaryKey: "",  // pk of the json objects, ex: "instanceId"

    server: AWS.server,
    errorMessage: undefined,

    initialize: function( data ) {
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
    handleError: function( req, msg, error ) {
        this.loading = false;
        this.errorMsg = msg;
        this.notifyError();
    },

    /**
     *  Make an async call if this.url.method exists
     *  This is not Backbony in the least, but treats a Model as a first class
     *  object, not a row in a DB table. 
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



// var instances = new AWS.EC2.Instances();
// instances.fetch();
// instances.on("change", doSomething )
 
// Fires "change" event on fetch()/sync()
// fetch/sync has a built-in success function.  Errors are not handled except
// by firing an "error" event

// AWS.EC2.Instance = AWS.EC2.Model.extend(
AWS.EC2.Instance = AWS.Model.extend(
{  
    initialize: function(){  
        // TODO: how call parent initialize()?
        //Backbone.Model.prototype.initialize.call(this, attributes, options);
    },  
    listName:   "instances",  // goes under collection?  FIXME
    primaryKey: "instanceId",   // change to?  FIXME
    defaults: {},   // any needed?  FIXME
    urls: {
        list:   "/ec2/describeInstances?",
        stop:   "/ec2/stopInstance?",
        start:  "/ec2/startInstance?",
        reboot: "/ec2/rebootInstance?"
    },

    /**
     * This is called whenever this object is created.  Massage any
     * ajax data into a backbone friendly layout.
     * Does set expect an array of objects?  Probably
     */
    parse: function( response, xhr ) {
        // pull reservations.instances into map
        if (response.reservations) { 
            debugger;
            return response;
        } else {
            return response;   // reservation already parsed out by collection
        }
    }
});  

//----------------------------------------------------------------------
// A Collection of AWS objects, we need to parse the AWS response data into
// a simple array of objects (client-side Nucleo..)
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

        options = _.extend(           
            {
                // FIXME - this is ugly, accessor?
                url: AWS.urlRoot + this.model.prototype.urls.list,
                dataType: 'jsonp', // "&callback=?" is added if dataType='jsonp'
                data: options,  // what about instanceId=?
                context: this
            }, options );

        // backbone.sync( method, model, options );
        $.ajax( options ).done( this.handleLoadResponse )
            .fail( this.handleError );
            // .always( function() { alert("complete"); });
    }

}
);

/**
 * A collection of EC2 instances, the fetch() needs to populate models
 */
AWS.EC2.Instances = AWS.Model.Collection.extend(
{
    model : AWS.EC2.Instance,  

    // pull reservations.instances into array
    parse: function( response, xhr ) {
        var instances = [];

        response = response || {};
        var self = this;
        $.each( response.reservations || {},
                function( i, reservation ) {
                    $.each( reservation.instances,
                            function( j, instance ) {
                                instances.push(instance );
                            });
                });
        return instances;
    },

    old : function() {  
        // return this.filter(
        //     function( game ) {  
        //         return game.get('releaseDate') < 2009;  
        //     });  
    }  
});  

/*
//----------------------------------------------------------------------
AWS.EC2.Instances = DefineClass(
    AWS.Model,
{
    listName:   "instances",
    primaryKey: "instanceId",

    url: {
        list:   "/ec2/describeInstances?",
        stop:   "/ec2/stopInstance?",
        start:  "/ec2/startInstance?",
        reboot: "/ec2/rebootInstance?"
    },

    init: function( data ) {
        AWS.Model.init.call( this, data );

        this.loaded = false;

        this.loadAsync();

        // listen for dataLoaded and populate this.instance
    },

    // this could be generic unless you want to munge the response some way
    // for example, losing instance reservations.
    handleLoadResponse: function( response ) {

        var instances = {};

        // this doesn't work with jsonp, would need foo( { error: "doh!" } );
        this.checkForErrors( response );

        // pull reservations.instances into map
        var self = this;
        $.each( response.reservations || {},
                function( i, reservation ) {
                    $.each( reservation.instances,
                            function( j, instance ) {
                                instances[ instance.instanceId ] =
                                    instance;
                            });
                });
        this[this.listName] = instances;

        this.notifyLoaded();
    },

    checkForErrors: function( response ) {
        if (response.error) {
            this.handleError( response.error );
        }
    },

    getInstanceName: function( inst ) {
        if (inst.tags && inst.tags[0] && inst.tags[0].key == "Name") {
            return inst.tags[0].value || inst.instanceId;
        } else {
            return inst.instanceId;
        }
    },

    start: function( instanceId ) {
        this.executeAsync("start");
    },
    stop: function( instanceId ) {
        this.executeAsync("stop");
    },
    reboot: function( instanceId ) {
        this.executeAsync("reboot");
    },
    terminate: function( instanceId ) {
        this.executeAsync("terminate");
    }
}
);
*/
