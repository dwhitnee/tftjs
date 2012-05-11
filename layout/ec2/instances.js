var AWS = AWS || {};
AWS.EC2 = AWS.EC2 || {};

//----------------------------------------------------------------------
// This screams for a Model object with "onDataLoaded" notifications
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
AWS.Model = DefineClass(
{
    //----------------------------------------------------------------------
    // Each model must supply these for the default mecahnisms to work
    //----------------------------------------------------------------------
    listName: "",    // the name of the json array returned, ex: "instances"
    primaryKey: "",  // pk of the json objects, ex: "instanceId"


    server: "https://dwhitney.desktop.amazon.com:6253/x/sdk",

    listeners: [],
    errorMessage: undefined,

    objects: {},   // hash of the model objects keyed by primaryKey

    init: function( data ) {
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

    /**
     * ex: instances.getData("i-1234");
     *
     * @param primaryKey an index into the list of objects
     * @return the list of objects, or
     */
    getData: function( key ) {
        if (!key) {
            return this[this.listName];
        } else {
            return this[this.listName][key];
        }
    },

    /**
     * Tell listeners this Model is current
     */
    notifyLoaded: function() {
        this.notifyListeners("loaded");
        this.loading = false;
    },

    /**
     * Tell listeners this Model had a bad day
     */
    notifyError: function() {
        this.notifyListeners("error");
        this.loading = false;
    },

    // should this just be jQuery events?
    // onLoad, onError, ...?
    notifyListeners: function( event ) {
        var self = this;
        $.each( this.listeners,
                function( i, listener ) {
                    var context = listener.context || this;
                    // check if isFunc( success ) TODO
                    listener.success.call( context, self );
                });
    },
    /**
     * Get notified when an event happens on this Model object by passing
     * a callback object:
     * callback = {
     *         success: function(){...}
     *         error: function() {...}
     *         context: this,
     *         userData: { ... }
     */
    addListener: function( callback ) {
        this.listeners.push( callback );
    },

    // removeListener: function( callback ) {
    //     this.listeners.remove( callback );   TBD
    // },

    /**
     *  Request the "list" function and try handle it generically
     *  @param args requestParams, ex: { instanceId: "i-1234" }
     *  @return immediate, will call success/error callbacks when done
     */
    loadAsync: function( args ) {
        this.loading = true;

        var url = this.server + this.url.list;

        $.ajax({
                   url: url, // "&callback=?" is added if dataType='jsonp'
                   dataType: 'jsonp',
                   data: args,
                   context: this,
                   success: this.handleLoadResponse,
                   error: this.handleError
               }
              );

    },

    /**
     *  generic loader of json into a pk-keyed hash of objects
     */
    handleLoadResponse: function( response ) {

        // this doesn't work with jsonp, would need foo( { error: "doh!" } );
        // this.checkForErrors( response );

        var objects = {};

        // pull reservations.instances into map
        var self = this;
        $.each( response[self.listName] || {},
                function( i, obj ) {
                    var pk = obj[ self.primaryKey ];
                    if (pk) {
                        objects[ pk ] = obj;
                    } else {
                        // data has no primary key, now what?  TODO
                    }
                });

        // ex: this.instances
        this[this.listName] = objects;

        this.notifyLoaded();
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
AWS.EC2.Model = DefineClass(
    AWS.Model,
{
    init: function( data ) {
        AWS.Model.init.call( this, data );
    }
});

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
