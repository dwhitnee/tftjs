// require aws.js

var AWS = AWS || {};
AWS.EC2 = AWS.EC2 || {};

//----------------------------------------------------------------------
//  AWS services are not particularly RESTful, ie, they don't have a
//  URL that you can PUT and GET against.  They are more SOAPy so this
//  Model class is closer in spirit to the CDK Models.
//  You can get a list, and make method calls using the Model
//  (ex: instance.stop() )
//----------------------------------------------------------------------

// Fires "change" event on fetch()/sync()
// fetch/sync has a built-in success function.  Errors are not handled except
// by firing an "error" event

// AWS.EC2.Instance = AWS.EC2.Model.extend(
AWS.EC2.Instance = AWS.Model.extend(
{
    idAttribute: "instanceId",    // primary key
    listName:   "instances",  // goes under collection?  FIXME
    defaults: {},   // any needed?  FIXME

    urls: {
        list:   "/ec2/describeInstances?",   // how to describe one?
        stop:   "/ec2/stopInstance?",
        start:  "/ec2/startInstance?",
        reboot: "/ec2/rebootInstance?"
    },

    // get data for a single instance 
    sync: function(method, model, options) {
        var args = { instanceIds: [this.get("instanceId")] };

        return AWS.Model.prototype.sync.call( 
            this, "read", model, this.addRequestArgs( options, args ));
    },
    /**
     * Called for Model.sync(), expects only a single object
     * 
     * This is called whenever this object is created.  Massage any
     * ajax data into a backbone friendly layout.
     */
    parse: function( response, xhr ) {
        var instances = this.parseInstances( response, xhr );

        return (instances.length === 1)? instances[0] : response;

        // probably an error if not a single instance, but hope for the best.
    },

    // flatten reservations into instances
    parseInstances: function( response, xhr ) {
        this.beforeParse( response, xhr );

        if (response && response.reservations) {
            var instances = [];
            $.each( response.reservations,
                    function( i, reservation ) {
                        $.each( reservation.instances,
                                function( j, instance ) {
                                    instances.push(instance );
                                });
                    });
            return instances;
        }
        // hope for the best (server did parsing or just a set( attrs ) call)
        return response;
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
    },

    // pull tag name from all tags
    getName: function() {
        var tags = this.get("tags") || [];

        for (var i = 0; i < tags.length; i++) {
            if (tags[i].key == "Name" && tags[0].value) {
                return tags[0].value;
            }
        }

        this.set("instanceId", "i-1d3c357b");
        this.on("error", function( model, resp, xhrOptions) {
                    alert( this.errorMessage || resp.statusText );
                }, this /* context */ );
        this.fetch();

        return this.get("instanceId");
    }
});


/**
 * A collection of EC2 instances, a good place to put filters
 */
AWS.EC2.Instances = AWS.Model.Collection.extend(
{
    model : AWS.EC2.Instance,

    // flatten reservations into instances
    parse: function( response, xhr ) {
        return this.model.prototype.parseInstances( response, xhr );
    },



    //----------------------------------------
    // experimental
    //----------------------------------------
    // filters:
    // this.instances.where( { instanceType: "t1.micro" } );

    // complex filter (data is complex, not the filter)
    // stopped, terminated, running, pending
    whereStateIs: function( inState ) {
        return this.filter(
            function( instance ) {
                var state = (instance && instance.get("state")) ? 
                    instance.get("state").name : "";
                return state == inState;
            });
    }
});
