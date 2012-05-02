
// (function dostuff_(global, $){
//      var W = global.Widget = global.Widget || {};

//      var myFunc = function() {  }
     
//      (function utils_bind(){
// 	  this.util = W.util || {};
// 	  this.util.myFunc = myFunc;
//       }).apply(W);

//  })(this, jQuery||{});

// dostuff_( window.AWS, jQuery );


var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Basic widget that has a view div that can be drawn into
//----------------------------------------------------------------------

Dashboard.GridLayout = DefineClass(
    Dashboard.Widget,
{
    init: function( data ) {
        this.widgetData = undefined;
        this.cookieName = "gridlayout";
        this.columnClass = "widget-list";
        this.id = "gridlayout" + Dashboard.GridLayout.counter++,
        Dashboard.Widget.init.call( this, data );
    },

    serialize: function() {
        var columns = [];
        this.view.find( "."+this.columnClass ).each(
            function() {
                columns.push( $(this).sortable('toArray').join(','));
            });
 
        return columns.join('|');
    },

    save: function() {
        $.cookie( this.cookieName, this.serialize() );
        // alert( this.serialize() );
        // debugger
    },

    restore: function() {
        this.widgetData = $.cookie( this.cookieName ); 
    },

    // not to be confused with draw(), this builds the DOM
    render: function() {

        // this we will add when done massaging DOM
        var $layout = $('<div id="'+this.id+'"/>');

        if (!this.widgetData) { return; }

        var columns = this.widgetData.split('|');
 
        // first column needs to be identified for sortable?
        var first = "first";

        for ( var c in columns ) {

            var $col = $('<div class="column left ' + first + '" />');
            var $list = $('<ul class="' + this.columnClass + '"/>');
            $col.append( $list );

            first = "";

            if ( columns[c] != '' ) {
                var items = columns[c].split(',');
                
                for ( var i in items ) {

                    var $widgetContainer = $('<li/>').
                        attr("id", items[i] ).
                        addClass("widget-container");

                    // TODO: make me more interesting
                    var $widget = $('<span />').text(  "Widget " + items[i] );

                    $widgetContainer.append( $widget );
                    $list.append( $widgetContainer );
                }
            }
            
            $layout.append( $col );
        }
        $layout.append( $('<div class="clearer" />') ); 

        this.view.empty();
        this.view.append( $layout );

        this.makeSortable();
    },

    // connect all columns with this class, should 
    makeSortable: function() {
        var self = this;
        this.view.find( "."+this.columnClass ).sortable(
            {
                // connectWith: '#dashboard-layout .widget-list',
                // allow cross column dragging, but only in this Widget
                connectWith: "#"+this.id+" ."+this.columnClass,
                placeholder: 'placeholder',
                forcePlaceholderSize: true,
                update: function(e, ui) { self.save();  }
                // grid: [50, 20] 
            }
        );
        }

});

Dashboard.GridLayout.counter = 1;


// testing
$(document).ready(
    function() {
        var grid1 = new Dashboard.GridLayout( 
            {
                widgetData: "D,E|C|B,A"
            } );

        var grid2 = new Dashboard.GridLayout( 
            {
                widgetData: "Q,R|T,S|V"
            } );

        $("#dashboard-layout1").append( grid1.getEl() );
        $("#dashboard-layout2").append( grid2.getEl() );

        grid1.render();
        grid2.render();
    }
);

