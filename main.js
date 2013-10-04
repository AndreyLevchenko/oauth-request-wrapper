var OAuth = require('oauth').OAuth;

var fs = require('fs');
var url = require('url');
var basicRequest = require('request');
                                  

var request = function(options, callback){
    var urlParts = url.parse(options.uri);
    
    if (urlParts.auth){
        executeBasic.apply(this, arguments);
    } else {
        executeOAuth.apply(this, arguments);
    }
};

request.oauthConfig = {
  jiraUrl : undefined,
  consumerPrivateKeyFile : undefined,
  oauthAccessTokenSecret : undefined,
  consumerKey : undefined,
  oauthAccessToken : undefined,
  callbackUrl : undefined
};

function executeBasic(){
    basicRequest.apply(this, arguments);
}
function executeOAuth(options, callback){
    var requestBody,
        requestCallback = function(error, data, resp){
            if (error==null){
                data = JSON.parse(data);
            }
            callback && callback(error, resp, data);
        },
        contentType = "application/json",
        config = request.oauthConfig;

    var consumer = mayBeBuildConsumer(); 
        
    if (options.body){
        if( typeof options.body != "string" ) {
            requestBody = object2body(options.body);
        } else {
            requestBody = options.body;
        }
    }
    
    switch(options.method){
        case "GET":{
                       consumer.get(options.uri, 
                                config.oauthAccessToken, 
                                config.oauthAccessTokenSecret, 
                                contentType,
                                requestCallback
                        );
                        break;
                    }
        case "POST":{
                       consumer.post(options.uri, 
                                config.oauthAccessToken, 
                                config.oauthAccessTokenSecret, 
                                requestBody, 
                                contentType,
                                requestCallback
                        );
                        break;
            
        }
        case "PUT":{
                       consumer.put(options.uri, 
                                config.oauthAccessToken, 
                                config.oauthAccessTokenSecret, 
                                requestBody, 
                                contentType,
                                requestCallback
                        );
                        break;
            
        }
        case "DELETE":{
                       consumer.delete(options.uri, 
                                config.oauthAccessToken, 
                                config.oauthAccessTokenSecret,
                                requestCallback
                        );
                        break;
            
        }
        
    }
    
}


                                 
function object2body(params){
    return JSON.stringify(params);
}
function mayBeBuildConsumer(){
    var config = request.oauthConfig, privateKeyData;
   


    privateKeyData = fs.readFileSync(config.consumerPrivateKeyFile, "utf8");
    
    if (request.consumer === undefined){
      request.consumer = new OAuth(config.jiraUrl + "/plugins/servlet/oauth/request-token",
                                  config.jiraUrl +"/plugins/servlet/oauth/access-token",
                                  config.consumerKey,
                                  "",
                                  "1.0",
                                  config.callbackUrl,
                                  "RSA-SHA1",
                                   null,
                                   privateKeyData
                                 );
        
    }
    
    return request.consumer;
} 



module.exports = request;

