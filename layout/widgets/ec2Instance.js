var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Display basic EC2 instace info.
//
// This screams for a Model object with "onDataLoaded" notifications
//----------------------------------------------------------------------
Dashboard.Widget.EC2Instance = DefineClass(
    Dashboard.Widget,
{
    type: "Widget-EC2Instance",
    text: "Click me to change color",
    settingsMode: false,

    //----------------------------------------
    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        this.loading = true;

        this._buildSettingsToggle();

        this.loadInstances();
    },

    setInstance: function( instanceId ) {
        this.instance = this.instances.getData( instanceId );
        this.instanceId = instanceId;
    },

    toggleSettingsMode: function() {
        this.settingsMode = !this.settingsMode;
        this.render();
    },

    // the button that will toggle between Settings view and regular view
    _buildSettingsToggle: function() {

        // should callback be its own var or inline?
        $(this.view).on("click", ".settingsToggle", this,  // passed as e.data
                        function( e ) {
                            e.data.toggleSettingsMode();
                        });

        var icon = "http://www.pnsn.org/images/small_info_icon.png?1336068836";

        // this.$settingsToggle= $('<span class="settingsToggle">').text("[i]");
        this.$settingsToggle= $('<img class="settingsToggle">').
            attr("src", icon);
    },

    loadInstances: function() {
        // should be wired up in Controller, not here.
        this.instances = new AWS.EC2.Instances();

        this.instances.addListener(
            {
                context: this,
                success: this.handleDataLoaded
            } );
    },

    checkForErrors: function( response ) {
        if (response.error) {
            this.handleError( response.error );
        }
    },

    //----------------------------------------
    // unfortunately with jsonp, the error message needs to be jsonp as well
    // so we can't display raw error results
    //----------------------------------------
    handleError: function( req, msg, error ) {
        this.loading = false;
        this.view.empty();
        this.view.append( $('<div class="error"/>').text("d'oh!: " + msg) );
    },

    //----------------------------------------
    // target of Model.notifyListeners("update")
    //----------------------------------------
    handleDataLoaded: function() {

        // stop spinning
        this.loading = false;

        // display data if selected
        if (this.instanceId) {
            this.setInstance( this.instanceId );
        }
        this.render();
    },

    //----------------------------------------
    // entry point to rendering the widget
    //----------------------------------------
    render: function() {
        var $div;

        if (this.loading) { return; }

        if (this.settingsMode) {
            $div = this.renderSettingsView();
        } else {
            $div = this.renderInstanceView();
        }

        this.view.empty();
        this.view.append( $div );
    },

    //----------------------------------------
    // display UI to select an instance
    //----------------------------------------
    renderSettingsView: function() {
        var $div = $('<div class="settings">');

        $div.append( $('<div class="title"/>').text("Settings") );

        var $menu = $("<select>");

        var self = this;
        $.each( this.instances.getData() || {},
                function( instanceId, instance ) {

                    var name = self.instances.getInstanceName( instance );

                    // var selected =
                    //     (instanceId == self.instanceId) ? 'selected' : false;
                    $menu.append(
                        $('<option value="' + instanceId + '"/>').
                            attr("selected", instanceId == self.instanceId ).
                            text( name ) );
                });

        var useNewInstance = function( e ) {
            self.setInstance( e.target.value );
            self.toggleSettingsMode();
        };
        $menu.on("change", useNewInstance );

        $div.append( $("<div/>").text("Instance: ").append( $menu ));
        $div.append( this.$settingsToggle );

        return $div;
    },

    //----------------------------------------
    // display "please select.." or actual data
    //----------------------------------------
    renderInstanceView: function() {
        var inst = this.instance;

        var $div = $('<div class="inner"/>');

        if (!inst) {
            $div.append( $('<div class="title"/>').text("select an instance") );
        } else {
            this._displayInstanceData( $div, inst );
        }

        $div.append( this.$settingsToggle );

        return $div;
    },

    //----------------------------------------
    // display actual data
    //----------------------------------------
    _displayInstanceData: function( $div, inst ) {

        var state = inst.state.name;
        var name = this.instances.getInstanceName( inst );

        $div.append($('<div class="title"/>').text(
                        "EC2 Instance " + inst.instanceId ));

        $div.append( $('<span/>').css("font-weight","bold").text( name ),
                     $('<span/>').text(" is "),
                     $('<span class="' + state + '"/>').text( state ));

        $div.append($('<div/>').text(
                        "IP: " + (inst.publicIpAddress || "N/A") ));

        // $div.append($("<div/>").text("Volumes: " + inst.volumes[0] ));
        $div.append($('<div class="type"/>').text(
                        inst.instanceType + " (" +
                            inst.placement.availabilityZone + ")"));

        var $status = $('<div class="status">');
        var $box = $("<''>");
        $status.append( $box );

        var $devices = $('<div class="devices"/>');
        $.each( inst.blockDeviceMappings || [],
                function( i, device ) {
                    var $li = $('<li/>');
                    var dev = device.deviceName;
                    if (device.ebs) {
                        dev += " (" + device.ebs.volumeId + ")";
                    }
                    $devices.append( $li.text( dev ));
                });

        $div.append( $devices );

        var $start =  $("<button>").text("Start");
        var $stop =   $("<button>").text("Stop");
        var $reboot = $("<button>").text("Reboot");

        var $buttons = $('<div class="buttonBar"/>');
        $buttons.append( $start, $stop, $reboot );

        $div.append( $buttons );
    }


}
);
