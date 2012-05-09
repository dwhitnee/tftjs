var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Basic widget that has a view div that can be drawn into
//----------------------------------------------------------------------
Dashboard.Widget = DefineClass(
{
    type: "Widget",
    size: { width: 1, height: 1 },
    text: "I'm a widget",
    id: 0,

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


