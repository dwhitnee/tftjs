/**
 * Let's make a draggable persistent layout of widgets!
 * 
 * Based on http://devheart.org/examples/jquery-customizable-layout-using-drag-and-drop/2-saving-and-loading-items/index.html#ex-2-1
 */

// Get all items from a container
function getItems(container) {
    var columns = [];
 
    $(container+ ' .widget-list').each(
        function() {
            columns.push( $(this).sortable('toArray').join(','));
        });
 
    return columns.join('|');
}

// Load items
function loadLayoutFromCookie( name, element ) {
    var data = $.cookie(name); 
    if ( data != null ) {
        renderLayout( data, element );
    } else {
        // alert('No items saved in "' + name + '".');
    }
}
 
// append list of divs repreenting the columns of the layout
function renderLayout( inItems, inContainer )
{
    var $layout = $("<div/>");

    var columns = inItems.split('|');
 
    // first column needs to be identified for sortable?
    var first = "first";

    for ( var c in columns ) {

        var $col = $('<div class="column left ' + first + '" />');
        var $list = $('<ul class="widget-list"/>');
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

    inContainer.empty();
    inContainer.append( $layout );
}
 

$(document).ready(
    function(){

        loadLayoutFromCookie( "items", $("#dashboard-layout") );

        $('#dashboard-layout .widget-list').sortable(
            {
                connectWith: '#dashboard-layout .widget-list',
                placeholder: 'placeholder',
                forcePlaceholderSize: true,
                update: function(e, ui) {
                    var items = getItems('#dashboard-layout');
                    $.cookie('items', items );
                }
                // grid: [50, 20] 
            }
        );
        
        $("#edit-layout").click(
            function(e) {
                var $layout = $("#dashboard-layout .widget-list");
                var disabled = $layout.sortable( "option", "disabled" );
                $layout.sortable( "option", "disabled", !disabled );

                if (disabled) {
                    $(this).text("Done");
                } else {
                    $(this).text("Edit");
                }
            });

        $("#hide1").click(
            function(e) {
                $("#C").hide("blind", {}, 300 );
            });
        $("#show1").click(
            function(e) {
                $("#C").show("blind", {}, 300 );
            });

    }
);



// Need a widget class
// widget must have display and control views
//  click 'control' and data inputs are displayed
// widgets should span columns
// Layout needs to be savable