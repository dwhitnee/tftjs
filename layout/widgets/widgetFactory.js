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
        // map predefined names to actual objects
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
                     this._buildWidget( widgetDesc.type, widgetDesc.data, id );
            } else {
                this.widgets[ id ] =
                     this._buildWidget("text",
                                       { text: "Unknown widget: " + id});

                // throw new Error("Unknown widget id: ", id);
            }
        }
        return this.widgets[ id ];
    },

    /**
     *  given a name like "colorSquare", create a widget of that type
     */
    _buildWidget: function( className, data, id ) {

        data.id = id;
        var widgetClass = this.widgetTypes[className] || "Dashboard.Widget";

        // eval is evil, but we are getting the function name from
        // our local list at least.
        try {
            return eval("new " + widgetClass + "( data )");
        } 
        catch (ex) {
            return new Dashboard.Widget( 
                { text: "Failed to create widget " + className } );
        }
    },


    // get widget configuration from data store (UserPrefs/Dynamo/cookie?)
    _getWidgetConfig: function( id ) {

        // var widgetStore = $.cookie("widgetData");

        var widgetStore = {
            "1": {
                type: "smoothieGraph",
                data: {}
            },
            "2": {
                type: "text",
                data: { "text": "Badger" }
            },
            "3": {
                type: "ec2Instance",
                data: { 
                    instanceId: "i-ebe9e488"
                }
            },
            "4": {
                type: "smoothieGraph",
                data: {}
            },
            "5": {
                type: "colorSquare",
                data: { "text": "Zombo (anything is possible!)" }
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
