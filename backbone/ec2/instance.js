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
        // same as Instances.sync
        options = options || {};
        options.url = AWS.urlRoot + this.urls.list;
        options.context = this;
        options.dataType = 'jsonp';

        // TODO: how to convince jQuery.param( s.data ); to jsonify correctly
        // want:   args={"instanceIds":["i-1d3c357e"]}
        // getting: args[instanceIds][] = "i-1d3c357e"
        // args[instanceIds][] = i-1d3c357e
        options.data = options.data || {};
        options.data.args = { instanceIds: [this.get("instanceId")] };
        // {"instanceIds":["i-1d3c357e"]}

        Backbone.sync("read", model, options );
    },
    /**
     * I think only collection.parse() is called
     * 
     * This is called whenever this object is created.  Massage any
     * ajax data into a backbone friendly layout.
     * Does set expect an array of objects?  Probably
     */
    parse: function( response, xhr ) {
        // pull reservations.instances into map
        if (response.reservations) {
            var instances = [];
            $.each( response.reservations || {},
                    function( i, reservation ) {
                        $.each( reservation.instances,
                                function( j, instance ) {
                                    instances.push(instance );
                                });
                    });
            debugger;
            return instances;
        } else {
            return response;   // reservation already parsed out by collection
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
    },

    // pull tag name from all tags
    getName: function() {
        var tags = this.get("tags") || [];

        for (var i = 0; i < tags.length; i++) {
            if (tags[i].key == "Name" && tags[0].value) {
                return tags[0].value;
            }
        }

        this.fetch().done( function(x,y,z) {
                               var i = 3;
                               debugger;
                           });
        return this.get("instanceId");
    }
});


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
