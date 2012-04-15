$(document).ready(
    function(){
        $('#dashboard-layout .sortable-list').sortable(
            {
                connectWith: '#dashboard-layout .sortable-list',
                placeholder: 'placeholder'
            }
        );
    }
);
