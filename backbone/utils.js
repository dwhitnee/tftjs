




































AWS.util = AWS.util || {};

// CORS access, response needs this header:
//  Access-Control-Allow-Origin: http://mywebappserver.com
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
