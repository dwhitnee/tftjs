var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
//  simple coloe cycler on click
//----------------------------------------------------------------------
Dashboard.Widget.ColorSquare = DefineClass( 
    Dashboard.Widget,
{
    type: "Widget-ColorSquare",
    color: "red",
    text: "Click me to change color",
    colors: ["red", "green", "blue", "yellow", "teal", "wheat", "white"],
    colorIndex: 0,

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        // fit to parent?  FIXME
        // this.view.css("width", this.size.width * 200 );
        // this.view.css("height", this.size.height * 200  );

        var self = this;
        $(this.view).on("click", this, 
                        function( e ) {
                            self.rotateColors.call( self );
                        });
    },

    rotateColors: function( ) {
        this.color = this.colors[this.colorIndex++];
        if (this.colorIndex >= this.colors.length) {
            this.colorIndex = 0;
        }
        this.render();
        // fire data update event
    },

    render: function() {
        this.view.css("background-color", this.color );
        this.view.append("<div/>").text( this.text );
    }
}
);
