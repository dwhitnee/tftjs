var AWS = AWS || {};
AWS.util = AWS.util || {};

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
