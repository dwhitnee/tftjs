var Dashboard = Dashboard || {};

//----------------------------------------------------------------------

//----------------------------------------------------------------------
Dashboard.Widget.EC2Instance = DefineClass( 
    Dashboard.Widget,
{
    type: "Widget-EC2Instance",
    text: "Click me to change color",
    settingsMode: false,

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        var self = this;
        var toggleSettingsMode = function( e ) {
            // var self = e.data;
            self.settingsMode = !self.settingsMode;
            self.render();
        };
        $(this.view).on("click", ".settingsToggle", this, toggleSettingsMode );

        var icon = "http://www.pnsn.org/images/small_info_icon.png?1336068836";

        // this.$settingsToggle= $('<span class="settingsToggle">').text("[i]");
        this.$settingsToggle= $('<img class="settingsToggle">').
            attr("src", icon);
    },

    renderSettingsView: function() {
        var $div = $('<div class="settings">');
        
        $div.append( $('<div class="title"/>').text("Settings") );

        var $menu = $("<select>").
            append('<option value="i-1234">i-1234</option>').
            append('<option value="i-5678">i-5678</option>').
            append('<option value="i-abcd">i-abcd</option>');

        $div.append( $("<div/>").text("Instance: ").append( $menu ));

        $div.append( this.$settingsToggle );

        this.view.empty();
        this.view.append( $div );
    },

    render: function() {
        if (this.settingsMode) {
            this.renderSettingsView();
        } else {
            this.renderInstanceView();
        }
    },
    renderInstanceView: function() {
        var inst = this.instance;

        var $div = $('<div class="inner"/>');
        $div.append($("<span/>").text("EC2 Instance " + inst.instanceId ));
        $div.append($("<div/>").css("font-weight","bold").text( inst.name ));
        $div.append($("<div/>").text("IP: " + inst.eip ));
        $div.append($("<div/>").text("Volumes: " + inst.volumes[0] ));

        var $status = $('<div class="status">');
        var $box = $("<''>");
        $status.append( $box );

        var $start =  $("<button>").text("Start");
        var $stop =   $("<button>").text("Stop");
        var $reboot = $("<button>").text("Reboot");

        var $buttons = $('<div class="buttonBar"/>');
        $buttons.append( $start, $stop, $reboot );

        $div.append( this.$settingsToggle );
        $div.append( $buttons );

        this.view.empty();
        this.view.append( $div );
    }
}
);
