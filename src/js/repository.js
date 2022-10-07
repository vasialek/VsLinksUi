let Repository = {
    _baseUrl: "http://localhost:28079/api/v1/",

    login: function(credentials, callback, errorCallback) {
        let errors = Validator.validateLogin(credentials);
        if (errors.length > 0) {
            errorCallback(errors);
        }

        this._doPost(this._baseUrl + "auth", null, JSON.stringify(credentials), function(json) {
            let response = JSON.parse(json);
            if (response.status !== true) {
                errorCallback(["Can't log into your account."]);
                return;
            }

            let payload = JwtHelper.parseJwt(response.jwt);
            console.log(payload);
            callback({
                Jwt: response.jwt,
                Nick: payload.nick,
                Email: payload.email,
                UserId: payload.uid,
            });
        }, function(xhr) {
            console.log("Error loggin in: " + xhr.statusText);
            errorCallback(["Server error logging into your account."]);
        });
    },

    loadCategories: function(jwt, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in"]);
            return;
        }

        this._doGet(this._baseUrl + "category", jwt, function(json) {
            let response = JSON.parse(json);
            if (response.status !== true) {
                errorCallback(["Can't load link categories from server."]);
                return;
            }
            callback(response.categories);
        }, function(xhr) {
            errorCallback(["Error loading link categories from server."]);
        });
    },

    createCategory: function(jwt, category, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        let errors = Validator.validateCategory(category);
        if (errors.length > 0) {
            errorCallback(errors);
            return;
        }

        this._doPost(this._baseUrl + "category", jwt, JSON.stringify(category), function(json) {
            let response = JSON.parse(json);
            if (response.status !== true) {
                errorCallback(["Can't create category on the server."]);
                return;
            }
            callback(response.category);
        }, function(xhr) {
            errorCallback(["Error creating category from the server."]);
        });

        // callback(category);
    },

    loadLinks: function(jwt, linkCategoryId, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        this._doGet(this._baseUrl + "links", jwt, function(json) {
            let response = JSON.parse(json);
            if (response.status !== true) {
                errorCallback(["Can't load links from server."]);
                return;
            }
            callback(response.links);
        }, function(xhr) {
            errorCallback(["Error loading links from server."]);
        });
    },

    createLink: function(jwt, link, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        let errors = Validator.validateLink(link);
        if (errors.length > 0) {
            errorCallback(errors);
            return;
        }

        this._doPost(this._baseUrl + "links", jwt, JSON.stringify(link), function(json) {
            let response = JSON.parse(json);
            if (response.status !== true) {
                errorCallback(["Can't create link on the server."]);
                return;
            }
            callback(response.link);
        }, function(xhr) {
            errorCallback(["Error creating link on the server."]);
        });
    },

    deleteLink: function(jwt, linkId, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        this._doDelete(this._baseUrl + "links?id=" + linkId, jwt, function(json) {
            let response = JSON.parse(json);
            if (response.status !== true) {
                errorCallback(["Can't delete link on the server."]);
                return;
            }
            callback(response.link);
        }, function(xhr) {
            errorCallback(["Error deleting link on the server."]);
        });

        errorCallback(["Can't delete non-existing link."]);
    },

    voteLink: function(jwt, linkId, vote, callback, errorCallback) {
        errorCallback(["Repository.voteLink is not implemented"]);
    },

    updateLink: function(jwt, link, callback, errorCallback) {
        errorCallback(["Repository.updateLink is not implemented"]);
    },

    _doGet(url, jwt, callback, errorCallback) {
        this._doRequest(url, jwt, "GET", callback, errorCallback);
    },

    _doDelete(url, jwt, callback, errorCallback) {
        this._doRequest(url, jwt, "DELETE", callback, errorCallback);
    },

    _doRequest(url, jwt, method, callback, errorCallback) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        this._setAuthenticationHeader(xhr, jwt);
        xhr.onload = function() {
            console.log("Got response from server: " + xhr.status + " (" + xhr.statusText + ")");
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.responseText);
            } else {
                errorCallback(xhr);
            }
        };
        xhr.onerror = function() {
            console.log("Error sending " + method + " request to " + url + "." + xhr.status + " " + xhr.statusText);
            errorCallback(xhr);
        };
        xhr.send();
    },

    _doPost(url, jwt, data, callback, errorCallback) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        this._setAuthenticationHeader(xhr, jwt);

        xhr.onload = function() {
            console.log("Got response on POST from server: " + xhr.status + " (" + xhr.statusText + ")");
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.responseText);
            } else {
                errorCallback(xhr);
            }
        };
        xhr.onerror = function() {
            console.log("Error POSTing request to " + url + ". " + xhr.status + " " + xhr.statusText);
            errorCallback(xhr);
        };
        xhr.send(data);
    },

    _setAuthenticationHeader(xhr, jwt) {
        if (jwt !== null && jwt.length > 0) {
            xhr.setRequestHeader("Authorization", "Bearer " + jwt);
        }
    }
};
