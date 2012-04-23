var Dashboard = {};

//----------------------------------------------------------------------
// Basic widget that has a view div that can be drawn into
//----------------------------------------------------------------------
Dashboard.Widget = DefineClass(
{
    view:      $("<div/>").text("put widget here"),
    loading:   $("<div/>").text("loading..."),  // make spinny

    size: { width: 1, height: 1 },

    init:  function( data ) {
        if (data) {
            $.extend( this, data );
        }
    },
    
    // fill in widget div
    draw: function() {
        this.view.empty();
        this.view.append("<div/>").text("yowza");
    },
    
    // set widget to spinning
    setLoading: function() {
        this.view.empty().append( this.loadingEl );
    }
});
