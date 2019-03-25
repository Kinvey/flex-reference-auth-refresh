const sdk = require('kinvey-flex-sdk');

const packageJson = require('./package.json');

// Log the service version for debugging
console.log(`Service version ${packageJson.version} initiated.`);

function generateRandomString(){
  return Math.random().toString(36).substring(7);
}

function validateLogin(username, password){
  //Some way of validating the login data
  if(username === 'user' && password === 'password'){
    return true;
  }
  //If invalid
  return false;
}

function validateRefreshData(grantType, refreshToken){
  //Some way of validating the login data
  if(grantType !== 'refresh_token'){
    return false;
  }
  //Validate the token in some way

  //If invalid
  return true;
}

// Init the sdk providing the flex service shared secret
sdk.service({ sharedSecret: '<Shared secret of the flex service>' }, (err, flex) => {
  // Initiate the flex auth
  const flexAuth = flex.auth;

  // Handler for authentication
  function authenticate(context, complete, modules) {
    console.log('Authentication request.');
    //Validate username and password
    const username = context.body && context.body.username;
    const password = context.body && context.body.password;
    if(!validateLogin(username, password)){
      // If login is wrong return access denied.
      console.log(`Authentication failed. Request data ${JSON.stringify(context.body)}`);
      return complete().accessDenied('The provided login information is invalid.').next();
    }
    // If Login was valid generate access and refresh tokens and the time
    // the access_token expires as expires_in (this is in seconds)
    const result = {
      token: 'accessToken' + generateRandomString(),
      refresh_token: 'refreshToken' + generateRandomString(),
      expires_in: 3600 //Seconds
    };
    console.log(`Authentication successful. Returning data ${JSON.stringify(result)}`);
    return complete().setToken(result).ok().next();
  }

  // Handler for token refresh
  function refresh(context, complete, modules) {
    console.log('Token refresh request.');
    const grantType = context.body && context.body.grant_type;
    const refreshToken = context.body && context.body.refresh_token;
    // Validate the refresh token is valid and the grant_type is refresh_token
    if(!validateRefreshData(grantType, refreshToken)){
      console.log(`Refresh failed. Request data ${JSON.stringify(context.body)}`);
      return complete().accessDenied('The provided refresh data is invalid.').next();
    }
    const result = {
      token: 'newAccessToken' + generateRandomString(),
      refresh_token: 'newRefreshToken' + generateRandomString(),
    };
    console.log(`Refresh successful. Returning data ${JSON.stringify(result)}`);
    return complete().setToken(result).ok().next();
  }

  // Register the authenticate and refresh functions with flex.
  flexAuth.register('authenticate', authenticate);
  flexAuth.register('refresh', refresh);
});
