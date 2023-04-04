class LinkCategoryRepository {
    _url = "https://p26fe7mvu5zvz3sjgzuocgx3ry0mumxp.lambda-url.eu-north-1.on.aws/";

    loadCategories(jwt, callback, errorCallback) {
        const self = this;
        this._doRequest(this._url, jwt, "GET", function (json) {
            LogHelper.log(`Got link categories: ${json}`);
            let categories = JSON.parse(json);
            let ar = [];
            categories.forEach(category => ar.push(self._map(category)));
            callback(ar);
        }, function (xhr) {
            errorCallback(["Error loading link categories from server."]);
        })
    }

    _map(category) {
        let c = new LinkCategoryModel({});

        c.linkCategoryId = category.link_category_id;
        c.userId = category.userId;
        c.name = category.name;
        c.iconClass = category.icon_class;

        return c;
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
