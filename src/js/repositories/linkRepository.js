class LinkRepository {
    _url = "https://zbia2ixa772qnmskjzsfg6xyme0dfbmt.lambda-url.eu-north-1.on.aws/";

    loadLinks(jwt, linkCategoryId, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        const self = this;
        this._doRequest(this._url, jwt, "GET", function(json) {
            let links = JSON.parse(json);
            // if (response.status !== true) {
            //     errorCallback(["Can't load links from server."]);
            //     return;
            // }
            let ar = [];
            links.forEach(link => ar.push(new LinkModel(link)))
            callback(ar);
        }, function(xhr) {
            errorCallback(["Error loading links from server."]);
        });
    }

    _map(link) {
        const self = this;
        let l = new LinkModel({});

        l.linkId = link.link_id;
        l.linkCategoryId = link.link_category_id;
        l.title = link.title;
        l.url = link.url;
        l.rating = link.rating;
        l.iconClass = link.icon_class;
        // todo: remove dependencies to KO
        l.isEditable = ko.observable(false);
        l.isReadMode = ko.computed(function() {
            return true;
            // return self.isEditable() === false;
        });

        return l;
    }

    _doRequest(url, jwt, method, callback, errorCallback) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        this._setAuthenticationHeader(xhr, jwt);
        xhr.onload = function() {
            LogHelper.log(`Got response from server: ${xhr.status} (${xhr.statusText})`);
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.responseText);
            } else {
                errorCallback(xhr);
            }
        };
        xhr.onerror = function() {
            LogHelper.log(`Error sending ${method} request to ${url}.${xhr.status} ${xhr.statusText}`);
            errorCallback(xhr);
        };
        xhr.send();
    }

    _setAuthenticationHeader(xhr, jwt) {
        // if (jwt !== null && jwt.length > 0) {
        //     xhr.setRequestHeader("Authorization", "Bearer " + jwt);
        // }
        xhr.setRequestHeader("Accept", "*/*");
    }
}