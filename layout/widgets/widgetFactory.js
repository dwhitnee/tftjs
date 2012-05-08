var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// translate a name to a widget, should this be all dynamic?
//----------------------------------------------------------------------
Dashboard.Widget.Factory = DefineClass( 
{
    widgets: {},
    init: function() {
        this.widgets.A = new Dashboard.Widget.SmoothieGraph();
        // this.widgets.A = new Dashboard.Widget( { text: "Alligator" });
        this.widgets.B = new Dashboard.Widget( { text: "Badger" });
        this.widgets.C = new Dashboard.Widget( { text: "Coyote" });
        this.widgets.D = new Dashboard.Widget.SmoothieGraph();
        this.widgets.E = new Dashboard.Widget.ColorSquare( { text: "Zombo! (click me)" });
    },

    getWidgetByName: function( name ) {
        if (this.widgets[name]) {
            return this.widgets[name];
        } else {
            return new Dashboard.Widget( { text: "Unknown widget " + name });
        }
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
