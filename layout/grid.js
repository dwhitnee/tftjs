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
        renderItems( data, element );
    } else {
        // alert('No items saved in "' + name + '".');
    }
}
 
function renderItems( inItems, inContainer)
{
    var html = '';
    var columns = inItems.split('|');
 
    var first = "first";

    for ( var c in columns ) {
        html += '<div class="column left ' + first + '"><ul class="widget-list">';
        first = "";

        if ( columns[c] != '' ) {
            var items = columns[c].split(',');
 
            for ( var i in items ) {
                html += '<li id="' + items[i] + 
                    '" class="widget-container">Widget ' + items[i] + '</li>';
            }
        }
 
        html += '</ul></div>';
    }
    html += '<div class="clearer">&nbsp;</div>'; 
    inContainer.html( html );
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