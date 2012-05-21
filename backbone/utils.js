var AWS = AWS || {};
AWS.util = AWS.util || {};

//----------------------------------------------------------------------
// CORS access, response needs this header:
//  Access-Control-Allow-Origin: http://mywebappserver.com
//----------------------------------------------------------------------

// Override the default implementation of `Backbone.ajax` to use jquery-jsonp
// Backbone.ajax = function() {
//     return $.jsonp.apply($, arguments);
// };

AWS.util.setupAjax = function() {
    // set up cross domain (CORS) flags
    
    var options;

    var cors = true;
    var jsonp = !cors;
    
    if (jsonp) {

        options = { dataType: 'jsonp' };

    } else if (cors) {

        options = {
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        };

    } else {

        options = { dataType: 'json' };

    }

    options = $.extend( options,
                        {
                      // don't run success CB after 10s passed
                      timeout: 10000
                  });

    // this is nice, but BB trashes these so we need to set them on each sync()
    $.ajaxSetup(  options );

    return options;
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
