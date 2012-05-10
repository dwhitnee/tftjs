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

    init: function( data ) {
        Dashboard.Widget.init.call( this, data );

        this.loading = true;

        this._buildSettingsToggle();

        this.loadInstances();

        // listen for dataLoaded and populate this.instance
    },

    setInstance: function( instanceId ) {
        this.instance = this.instances[ instanceId ];
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

    // jsonp ftw!
    loadInstances: function() {
        this.server = "https://dwhitney.desktop.amazon.com:6253/x/sdk";
        this.ec2 = {};
        this.ec2.describeAZs = "/ec2/describeAvailabilityZones?";
        this.ec2.describeInstances = "/ec2/describeInstances?";

        var url = this.server + this.ec2.describeInstances;

        // no failure handler
        // $.getJSON( url + "&callback=?", args, handleInstanceResponse);

        var args = {};  // instanceId=foo ?
        $.ajax({
                   url: url, // + "&callback=?",
                   dataType: 'jsonp',
                   data: args,
                   context: this,
                   success: this.handleInstanceResponse,
                   error: this.handleError
               }
              );

    },

    handleInstanceResponse: function( response ) {
        this.instances = {};
        
        // this doesn't work with jsonp, would need foo( { error: "doh!" } );
        this.checkForErrors( response );
        
        // pull reservations.instances into map
        var self = this;
        $.each( response.reservations || {},
                function( i, reservation ) {
                    $.each( reservation.instances,
                            function( j, instance ) {
                                self.instances[ instance.instanceId ] =
                                    instance;
                            });
                });
        
        // dataListeners.notify();
        // $.trigger("dataLoaded");
        // this should fire an event, or notify listeners that they
        // can take action on the instanceList.
        
        this.handleDataLoaded();
    },

    checkForErrors: function( response ) {
        if (response.error) {
            this.handleError( response.error );   
        }
    },

    // unfortunately with jsonp, the error message needs to be jsonp as well
    // so we can't display raw error results
    handleError: function( req, msg, error ) {
        this.loading = false;
        this.view.empty();
        this.view.append( $('<div class="error"/>').text("d'oh!: " + msg) );
    },

    handleDataLoaded: function() {

        // stop spinning
        this.loading = false; 
       
        // display data if selected
        if (this.instanceId) {
            this.setInstance( this.instanceId );
        }
        this.render();
    },
   
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

    renderSettingsView: function() {
        var $div = $('<div class="settings">');
        
        $div.append( $('<div class="title"/>').text("Settings") );

        var $menu = $("<select>");

        var self = this;
        $.each( this.instances || {},
                function( instanceId, instance ) {
                    // or tag if it exists
                    var name = self.getInstanceName( instance );

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

    renderInstanceView: function() {
        var inst = this.instance;

        var $div = $('<div class="inner"/>');

        if (!inst) {
            $div.append( $("<div/>").text("selcte an instance") );
        } else {
            this._renderInstanceView( $div, inst );
        }

        $div.append( this.$settingsToggle );

        return $div;
    },

    getInstanceName: function( inst ) {
        if (inst.tags && inst.tags[0] && inst.tags[0].key == "Name") {
            return inst.tags[0].value || inst.instanceId;
        } else {
            return inst.instanceId;
        }
    },
    _renderInstanceView: function( $div, inst ) {
        
        var state = inst.state.name;
        var name = this.getInstanceName( inst );

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
