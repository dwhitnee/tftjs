$(document).ready(
    function(){
        $('#dashboard-layout .widget-list').sortable(
            {
                connectWith: '#dashboard-layout .widget-list',
                placeholder: 'placeholder',
                forcePlaceholderSize: true
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
    }



);
