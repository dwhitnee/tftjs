var AWS = AWS || {};
AWS.util = AWS.util || {};

//----------------------------------------------------------------------
// CORS access, response needs this header:
//  Access-Control-Allow-Origin: http://mywebappserver.com
//----------------------------------------------------------------------
AWS.util.setupAjax = function() {
    //set up cross domain (CORS) flags
    $.ajaxSetup(
        {
            dataType: 'jsonp',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },

            timeout: 10000   // don't run success CB after 10s passed
        });
};

// where should this go?
AWS.util.setupAjax();


//----------------------------------------------------------------------
// handle errors found in Backbone.parse() like
//   { "error": ["Please reauth..."] }
//   { "error": [ 
//       {"code":"InvalidInstanceID.NotFound",
//        "status":400,
//        "message":"The instance ID alert('xss') does not exist"}]}
//----------------------------------------------------------------------
AWS.util.parseErrors = function( response, xhr ) {
    // if isArray( response.error )
    if (response && response.error && response.error.length > 0) {
        var messages = $.map (
            response.error, function( error ) {
                return (typeof error === "string") ? error : error.message;
            });
        return messages.join(",");
    }
    return undefined;
}
