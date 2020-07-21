let Repository = {
    login = function(user, callback, errorCallback) {

    },

    doLogin = function(clientId, clientEmail, clientPassword) {
        let rq = new XMLHttpRequest();
        rq.open("POST", gBaseUrl + "auth", true);
        rq.onload = function() {
            log("Got response " + rq.status + " (" + rq.statusText + ") from server...");
            if (rq.status == 200) {
                var resp = JSON.parse(rq.responseText);
                // console.log(resp);
                if (resp.status === true) {
                    setMessage("Successfully logged in", true, 10000);
                    gJwt = resp.jwt;
                    let payload = parseJwt(gJwt);
                    console.log(payload);
                    gUser.Nick = payload.name;
                    gUser.Email = payload.email;
                    gUser.UserId = payload.user_id;
                    initUi();
                }
            } else {
                gJwt = null;
                setMessage("Can't log you in, sorry!", false, 20000);
            }
        }
        rq.onerror = function() {
            log("Could not login to server!", "error");
            setMessage("Could not login to server!", false, 20000);
        }
    
        let lm = {
            client_id: clientId,
            email: clientEmail,
            password: clientPassword,
        };
        log("Sending: " + JSON.stringify(lm));
        rq.send(JSON.stringify(lm));
    }
};
