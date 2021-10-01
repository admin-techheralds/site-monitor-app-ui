
showErrorAlert = function(msg) {
    $(document).Toasts('create', {
        title:'Error',
        class: 'bg-danger',
        autohide : true,
        delay : 2000,
        body : msg
    })
}

showElement = function(e) {
    $(e).show();
}
hideElement = function(e) {
    $(e).hide();
}

logout = function() {
    firebase.auth().signOut();
}
getAuthenticatedHeader = async function() {
    const userIDToken = await getUserIDToken();
    if(! userIDToken) {
        console.log('User ID Token is found to be invalid');
        return undefined;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userIDToken
    }
}

getUserIDToken = async function() {
    const user = firebase.auth().currentUser;
    if(! user) {
        console.log('Current logged in user found to be invalid');
        return undefined;
    }
    try {
        const userIDToken = await user.getIdToken();
        return userIDToken;
    } catch(ex) {
        console.log("Error while getting the user id token. Ex:" + ex);
    }
    return undefined;
}

sendPostRequest = async function(url, data, cb) {
    const headers = await getAuthenticatedHeader();
    url = SERVICES_BASE_URL + url;
    console.log('Sending Post request to:' + url + ' with headers:' + JSON.stringify(headers))
    $.post({
        url: url,
        headers: headers,
        data: JSON.stringify(data),
        success: function(response) {
            console.log('Successful Response has come')
            cb(undefined, response)
        },
        error: function(err) {
            console.log('Soemthing went wrong...')
            cb(err, undefined);
        }
    })
}

sendGetRequest = async function(url, cb) {
    const headers = await getAuthenticatedHeader();
    // const headers = undefined;
    url = SERVICES_BASE_URL + url;
    // console.log('Sending Get request to:' + url + ' with headers:' + JSON.stringify(headers))
    $.get({
        url: url,
        headers: headers,
        success: function(response) {
            console.log('Successful Response has come')
            cb(undefined, response)
        },
        error: function(err) {
            console.log('Soemthing went wrong...')
            cb(err, undefined);
        }
    })
}