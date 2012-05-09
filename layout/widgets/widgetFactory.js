var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Can build widgets by type or by id
// translate a name to a widget type
//----------------------------------------------------------------------
Dashboard.Widget.Factory = DefineClass(
{
    widgets: {},   // cache of user widgets

    init: function() {

        // we could just eval( widget.name ) but that's evil and scary
        // map canned names to actaul objects
        this.widgetTypes = {
            "text"          : "Dashboard.Widget",
            "colorSquare"   : "Dashboard.Widget.ColorSquare",
            "smoothieGraph" : "Dashboard.Widget.SmoothieGraph",
            "ec2Instance"   : "Dashboard.Widget.EC2Instance"
        };
    },

    /**
     * given a unique widget id (per user),
     * return a widget configured with meta data store in DB
     */
    getWidgetById: function( id ) {

        if (!this.widgets[ id ]) {
            var widgetDesc = this._getWidgetConfig( id );
             if (widgetDesc) {
                this.widgets[ id ] =
                     this._buildWidget( widgetDesc.name, widgetDesc.data );
            } else {
                this.widgets[ id ] =
                     this._buildWidget("text",
                                       { text: "Unknonwn widget: " + id});

                // throw new Error("Unknown widget id: ", id);
            }
        }
        return this.widgets[ id ];
    },

    /**
     *  given a name like "colorSquare", create a widget of that type
     */
    _buildWidget: function( className, data ) {

        var widgetClass = this.widgetTypes[className] || "Dashboard.Widget";

        // eval is evil, but we are getting the function name from
        // our local store at least.
        return eval("new " + widgetClass + "( data )");
    },


    // get widget configuration from data store (UserPrefs/Dynamo/cookie?)
    _getWidgetConfig: function( id ) {

        // var widgetStore = $.cookie("widgetData");

        var widgetStore = {
            "1": {
                name: "smoothieGraph",
                data: {}
            },
            "2": {
                name: "text",
                data: { "text": "Badger" }
            },
            "3": {
                name: "text",
                data: { "text": "Coyote" }
            },
            "4": {
                name: "smoothieGraph",
                data: {}
            },
            "5": {
                name: "colorSquare",
                data: { "text": "Zomboe! (click me)" }
            }
        };

        return widgetStore[ id ];
    }

});


//----------------------------------------------------------------------
Dashboard.LayoutFactory = DefineClass(
{
    widgets: {},
    init: function() {

    },

    /**
     *  given a name like "colorSquare", create a widget of that type
     */
    createWidgetByName: function( name, data ) {

        var widgetClass = this.widgetTypes[name] || "Dashboard.Widget";

        // eval is evil, but we are getting the function name from
        // our local store at least.
        // return eval("new " + widgetClass + "( data )");
    }
});



//----------------------------------------------------------------------
Dashboard.DashboardStore = DefineClass(
{
    init: function() { },
    restore: function() {

        var data = this.getWidgetData();

        // take data and make widgets
        $.each( data.widgets,
                function( i, widget ) {
                    var w = eval("new " + widget.name + "( widget.data )");
                }
              );
    },
    getWidgetData: function() {
        return {
            widgets: [
                {
                    name: "Dashboard.Widget.ColorSquare",
                    data: { "text" : "Zombo!" }
                },
                {
                    name: "Dashboard.Widget",
                    data: { "text" : "Badger!" }
                }
            ]
        };
    }

});

$( function() {
       var dashy = new Dashboard.DashboardStore();
       dashy.restore();
});
