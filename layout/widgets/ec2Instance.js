var Dashboard = Dashboard || {};

//----------------------------------------------------------------------
// Display basic EC2 instace info.
//
// requires Collection of instances to be passed in:
//   { instances: new AWS.EC2.Instances(),
//     instanceId: "i-ebe9e488",   // optional default
// }
//----------------------------------------------------------------------
Dashboard.Widget.EC2Instance = DefineClass(
    Dashboard.Widget,
{
    type: "Widget-EC2Instance",
    text: "I'm a little nut so brown",
    settingsMode: false,

    //----------------------------------------
    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        this.loading = true;

        this._buildSettingsToggle();

        this.loadInstances();
    },

    setInstance: function( instanceId ) {
        this.instance = this.instances.get( instanceId );
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

        var icon = "../images/small_info_icon.png";

        // this.$settingsToggle= $('<span class="settingsToggle">').text("[i]");
        this.$settingsToggle= $('<img class="settingsToggle">').
            attr("src", icon);
    },

    loadInstances: function() {
        if (!this.instances) {
            throw new Error("No instances data source supplied");
        }

        // 'reset' is the backbone event fired when a collection is loaded
        // 'change' is fired on a single model loaded.
        this.instances.on("reset", this.handleDataLoaded, this /* context */ );
        this.instances.on("change", this.handleDataLoaded, this /* context */ );
        this.instances.on("error", this.handleError, this /* context */ );

        var options = {};
        // this.instances.addRequestArgs( 
        //     options, { instanceIds: ["i-abcdabcd"] } );

        this.instances.fetch( options );
    },

    //----------------------------------------
    // unfortunately with jsonp, the error message needs to be jsonp as well
    // so we can't display raw error results
    //----------------------------------------
    handleError: function( model, resp, xhrOptions ) {
        this.loading = false;
        this.view.empty();
        this.view.append( $('<div class="error"/>').
                          text("D'oh!").
                        append(
                            $('<div class="details"/>').
                                text( model.errorMessage )));
//                              text("Failed to load " + xhrOptions.url )));
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
    // display "please select.." or actual data
    //----------------------------------------
    render: function() {
        var $div;

        if (this.loading) { return; }

        // make sure we have something worthwhile to render
        if (!this.settingsMode && !this.instance) {
            this.settingsMode = true;
        }

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
        // $.each( this.instances.getData() || {},
        this.instances.each(
                function( inst, i ) {

                    var instanceId = inst.get("instanceId");
                    $menu.append(
                        $('<option value="' + instanceId + '"/>').
                            attr("selected", instanceId == this.instanceId ).
                            text( inst.getName() ) );
                }, this );

        var useNewInstance = function( e ) {
            self.setInstance( e.target.value );
            self.toggleSettingsMode();
        };
        $menu.on("change", useNewInstance );

        $div.append( $("<div/>").text("Instance: ").append( $menu ));
        $div.append( this.$settingsToggle );

        // $div.append( this.getStoppedList() );
        // $div.append( this.getInstancesByType("t1.micro") );

        return $div;
    },

    // experiment in filters
    getStoppedList: function() {
        var matches = $.map( 
            this.instances.whereStateIs("stopped"),
            function( instance ) { 
                return instance.get("instanceId");
            });
        
        return $('<div/>').text("Stopped: " + matches.join(", ") );
    },

    // experiment in filters
    getInstancesByType: function( type ) {
        var matches = $.map( 
            this.instances.where( { instanceType: type } ),
            function( instance ) { 
                return instance.get("instanceId");
            });
        
        return $('<div/>').text( type+"s: " + matches.join(", "));
    },

    //----------------------------------------
    //----------------------------------------
    renderInstanceView: function() {
        var inst = this.instance;

        var $div = $('<div class="inner"/>');

        $div.append( this._displayInstanceData( inst ) );
        $div.append( this.$settingsToggle );

        return $div;
    },

    //----------------------------------------
    // display actual data
    //----------------------------------------
    _displayInstanceData: function( inst ) {

        var $div = $('<div/>');

        var state = (inst && inst.get("state")) ? inst.get("state").name : "";

        $div.append($('<div class="title"/>').text(
                        "EC2 Instance " + inst.get("instanceId") ));

        $div.append( $('<span/>').css("font-weight","bold").text( inst.getName() ),
                     $('<span/>').text(" is "),
                     $('<span class="' + state + '"/>').text( state ));

        $div.append($('<div/>').text(
                        "IP: " + (inst.get("publicIpAddress") || "N/A") ));

        // $div.append($("<div/>").text("Volumes: " + inst.volumes[0] ));
        $div.append($('<div class="type"/>').text(
                        inst.get("instanceType") + " (" +
                            inst.get("placement").availabilityZone + ")"));

        // green square?  TODO
        var $status = $('<div class="status">');
        var $box = $('<div class="'+ state +'"/>');
        $status.append( $box );

        var $devices = $('<div class="devices"/>');
        $.each( inst.get("blockDeviceMappings") || [],
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

        return $div;
    }


}
);
