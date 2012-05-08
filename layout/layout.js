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
    // are these static/class variables?
    type: "GridLayout",   // can we get this dynamically?
    editableColor: "#8D8",
    fixedColor:    "#AFA",
    widgetData:    undefined,
    cookieName:   "gridlayout",
    columnClass:  "widget-list",
    widgetFactory: undefined,

    init: function( data ) {
        Dashboard.GridLayout.counter = Dashboard.GridLayout.counter || 1;

        this.id = "gridlayout" + Dashboard.GridLayout.counter++;
        Dashboard.Widget.init.call( this, data );

        this.restore();

        if (!this.widgetFactory ) {
            throw Error("No widgetFactory passed to Dashboard.GridLayout");
        }
    },

    // the builtin option is whether it is disabled, reverse that here.
    toggleEditable: function() {
        this.$columns.sortable("option", "disabled", this.isEditable() );

        if (this.isEditable()) {
            this.$columns.css("background", this.editableColor );
            this.view.find(".widget-container").css("cursor", "move");
        } else {
            this.$columns.css("background", this.fixedColor );
            this.view.find(".widget-container").css("cursor", "auto");
        }

    },
    isEditable: function() {
        return !this.$columns.sortable("option", "disabled");
    },

    serialize: function() {
        var columns = [];
        this.$columns.each(
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
        this.widgetData = $.cookie( this.cookieName ) || this.widgetData;;
    },

    // not to be confused with draw(), this builds the DOM
    render: function() {

        // this we will add when done massaging DOM
        var $layout = $('<div id="'+this.id+'"/>');

        if (!this.widgetData) { return; }

        var columns = this.widgetData.split('|');
 
        for ( var c in columns ) {

            var $col = $('<div class="column left" />');
            var $list = $('<ul class="' + this.columnClass + '"/>');
            $col.append( $list );

            if ( columns[c] != '' ) {
                var items = columns[c].split(',');
                
                for ( var i in items ) {

                    var $widgetContainer = 
                        $('<li class="widget-container"/>').
                        attr("id", items[i] );

                    // TODO: make me more interesting
                    var widget = this.widgetFactory.getWidgetByName( items[i]);
                    widget.render();
                    
                    $widgetContainer.append( widget.getEl() );
                    $list.append( $widgetContainer );
                }
            }
            
            $layout.append( $col );
        }
        $layout.append( $('<div class="clearer" />') ); 

        this.view.empty();
        this.view.append( $layout );

        this.makeSortable();
        this.toggleEditable();
    },

    // connect all columns with this class, should 
    makeSortable: function() {
        var self = this;
        
        this.$columns = this.view.find( "."+this.columnClass );
        this.$columns.sortable(
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


// testing
/*
$(document).ready(
    function() {
        var widgetFactory = new Dashboard.Widget.Factory();

        var grid1 = new Dashboard.GridLayout( 
            {
                widgetData: "D,E|C|B,A",
                widgetFactory: widgetFactory 
            } );

        var grid2 = new Dashboard.GridLayout( 
            {
                widgetData: "Q,R|T,S|V",
                widgetFactory: widgetFactory ,
                cookieName: "foo"
            } );

        $("#dashboard-layout1").append( grid1.getEl() );
        $("#dashboard-layout2").append( grid2.getEl() );

        $("#edit-layout-button").click(
            function(e) {
                grid1.toggleEditable();
                if (grid1.isEditable()) {
                    $(this).text("Done Editing");
                } else {
                    $(this).text("Change layout");
                }
            });

        // page is now laid out (with spinnies), finally do the work
        grid1.render();
        grid2.render();

        grid2.toggleEditable();
    }
);

*/