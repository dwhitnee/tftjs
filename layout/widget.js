var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Basic widget that has a view div that can be drawn into
//----------------------------------------------------------------------
Dashboard.Widget = DefineClass(
{
    // type: "Widget",
    size: { width: 1, height: 1 },
    text: "I'm a widget",

    getEl: function() {  return this.view; },
    start: function() {
        this.setLoading();
        // on("initialized", function() { this.render(); }
    },

    // c'tor
    init:  function( data ) {
        if (data) {
            $.extend( this, data );
        }
        var type = this.type || "Widget";
        this.view = $('<div class="'+ type +'"/>').html("put widget here");
        // load any data?
        this.start();
        
        // render should be called later manually to speed apparent display
        // that is, do the complex stuff post initial display
        // this.render();
        
        // do ajax then fire("initialized");   ?
    },

    clear: function() {
        this.view.empty();
    },
   
    // Build the DOM for the widget, this wont be called often like a
    // draw() might for animation
    render: function() {
        this.view.empty();
        this.view.append("<div/>").text( this.text );
    },
    
    // set widget to spinning
    setLoading: function() {

        if (!this.loadingView) {
            this.loadingView = $("<div/>").html("loading...");  // make spinny
        }
        this.clear();
        this.view.append( this.loadingView );
    }
});

Dashboard.Widget.prototype.getName = function() { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((this).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
};

Dashboard.Widget.Factory = DefineClass( 
{
    widgets: {},
    init: function() {
        this.widgets.A = new Dashboard.Widget( { text: "Alligator" });
        this.widgets.B = new Dashboard.Widget( { text: "Badger" });
        this.widgets.C = new Dashboard.Widget( { text: "Coyote" });
        this.widgets.D = new Dashboard.Widget( { text: "Dog" });
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


// var $widget = $('<span />').text("Widget " + items[i] );
//         return $('<span />').text(  "Widget " + items[i] );

Dashboard.Widget.ColorSquare = DefineClass( 
    Dashboard.Widget,
{
    type: "Widget-ColorSquare",
    color: "red",
    text: "Click me to change color",
    colors: ["red", "green", "blue", "yellow", "teal", "wheat", "white"],
    colorIndex: 0,

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        // fit to parent?  FIXME
        // this.view.css("width", this.size.width * 200 );
        // this.view.css("height", this.size.height * 200  );

        var self = this;
        $(this.view).on("click", this, 
                        function( e ) {
                            self.rotateColors.call( self );
                        });
    },

    rotateColors: function( ) {
        this.color = this.colors[this.colorIndex++];
        if (this.colorIndex >= this.colors.length) {
            this.colorIndex = 0;
        }
        this.render();
        // fire data update event
    },

    render: function() {
        this.view.css("background-color", this.color );
        this.view.append("<div/>").text( this.text );
    }
}
);





// testing
$(document).ready(
    function() {
        var w1 = new Dashboard.Widget.ColorSquare( 
            {
                color: "lightblue",
                size: { width: 2, height: 1},
                text: "color widget 1"
            } );
        var w2 = new Dashboard.Widget.ColorSquare( 
            {
                color: "lightgreen",
                text: "color widget 2"
            } );

        $("#widgetTest1").append( w1.getEl() );
        $("#widgetTest2").append( w2.getEl() );

        w1.render();
        w2.render();
    }
);

