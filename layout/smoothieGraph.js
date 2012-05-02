

// requires <script src="http://smoothiecharts.org/smoothie.js">
var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
//  simple coloe cycler on click
//----------------------------------------------------------------------
Dashboard.Widget.SmoothieGraph = DefineClass( 
    Dashboard.Widget,
{
    type: "Widget-SmoothieGraph",

    height: 190,
    width: 278,
    stopped: false,

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        // Random data
        this.line1 = new TimeSeries();
        this.line2 = new TimeSeries();

        this.chart = new SmoothieChart(
            { grid: 
              { strokeStyle: 'rgb(125, 0, 0)', 
                fillStyle: 'rgb(60, 0, 0)',
                lineWidth: 1, 
                millisPerLine: 250, 
                verticalSections: 6 
              } });

        this.chart.addTimeSeries(
            this.line1, 
            {
                strokeStyle: 'rgb(0, 255, 0)', 
                fillStyle: 'rgba(0, 255, 0, 0.4)',
                lineWidth: 3 
            });
        this.chart.addTimeSeries(
            this.line2, 
            {
                strokeStyle: 'rgb(255, 0, 255)', 
                fillStyle: 'rgba(255, 0, 255, 0.3)', 
                lineWidth: 3 
            });
    },

    // udpate graph data
    updateData: function() {
        this.line1.append( new Date().getTime(), Math.random() );
        this.line2.append( new Date().getTime(), Math.random() );
    },

    startAnimating: function( ) {
        // animate
        this.chart.start();
        this.stopped = false;

        var self = this;
        this.intervalID = setInterval(
            function() { 
                self.updateData();
            },
            1000);  

    },
    stopAnimating: function() {
        clearInterval( this.intervalID );
        this.chart.stop();
        this.stopped = true;
    },

    render: function() {
        this.view.empty();

        // doesnt work until layout done
        // this.width = this.view.width();
        // this.height = this.view.height();
        this.$canvas = $('<canvas width="'+ this.width + 
                         '" height="'+ this.height +'" />');

        var div = $("<div/>");
        div.append( this.$canvas );

        this.addHandlers();

        // start animation
        this.chart.streamTo( this.$canvas[0], 1000 );
        this.startAnimating();
        this.view.append( div );
    },

    addHandlers: function() {
        var self = this;
        this.$canvas.click(
            function(e) {
                if (self.stopped) {
                    self.startAnimating();
                } else {
                    self.stopAnimating();
                }
            });
        this.view.on("resize", this,
                     function(e) {
                         var f = 3;

                         debugger
                     });

    }
}
);
