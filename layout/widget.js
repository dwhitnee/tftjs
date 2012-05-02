var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Basic widget that has a view div that can be drawn into
//----------------------------------------------------------------------
Dashboard.Widget = DefineClass(
{
    size: { width: 1, height: 1 },

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
        this.view = $("<div/>").html("put widget here");
        // load any data?
        this.start();
        this.render();
        
        // fire("initialized"); 
    },

    clear: function() {
        this.view.empty();
    },
   
    // Build the DOM for the widget, this wont be called often like a
    // draw() might for animation
    render: function() {
        this.view.empty();
        this.view.append("<div/>").text("I'm a widget");
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


Dashboard.Widget.ColorSquare = DefineClass( 
    Dashboard.Widget,
{
    color: "red",
    text: "Click me to change color",
    colors: ["red", "green", "blue", "yellow", "teal", "wheat", "white"],
    colorIndex: 0,

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        this.view.css("width", this.size.width * 200 );
        this.view.css("height", this.size.height * 200  );

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

    }
);

