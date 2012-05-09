var Dashboard = Dashboard || {};

//----------------------------------------------------------------------

//----------------------------------------------------------------------
Dashboard.Widget.EC2Instance = DefineClass( 
    Dashboard.Widget,
{
    type: "Widget-EC2Instance",
    text: "Click me to change color",

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        // var self = this;
        // $(this.view).on("click", this, 
        //                 function( e ) {
        //                     self.rotateColors.call( self );
        //                 });
    },
    
    render: function() {
        var $div = $("<div/>");
        $div.append($("<span/>").text("EC2 Instance " + this.instanceId ));

        var $start = $("<button>").text("Start");
        var $stop = $("<button>").text("Stop");
        var $reboot = $("<button>").text("Reboot");

        var $buttons = $("<div/>");
        $buttons.append( $start, $stop, $reboot );
        $div.append( $buttons );

        this.view.empty();
        this.view.append( $div );
    }
}
);
