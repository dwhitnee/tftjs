var Dashboard = {};

//----------------------------------------------------------------------
// Basic widget that has a view div that can be drawn into
//----------------------------------------------------------------------
Dashboard.Widget = DefineClass(
{
    view:      $("<div/>").text("put widget here"),
    loading:   $("<div/>").text("loading..."),  // make spinny

    size: { width: 1, height: 1 },

    start: function() {
        setLoading();
        init();
        // on("initialized", function() { this.draw(); }
    },

    init:  function( data ) {
        if (data) {
            $.extend( this, data );
        }
        // load any data?
        
        // fire("initialized");
    },
    
    // fill in widget div
    draw: function() {
        this.view.empty();
        this.view.append("<div/>").text("I'm a widget");
    },
    
    // set widget to spinning
    setLoading: function() {
        this.view.empty().append( this.loadingEl );
    }
});


Dashboard.Widget.ColorSquare = DefineClass( 
    Dashboard.Widget,
{
    color: red,

    render: function() {
        this.view.css("background-color", color );
    }
}
);



// testing
$(document).ready(
    function() {
        var w = new Dashboard.Widget.ColorSquare( 
            {
                color: blue
                // container: $("#widget")
            } );
        $();
    }
);

