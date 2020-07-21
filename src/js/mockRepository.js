let Repository = {
    self: this,

    login: function(credentials, callback, errorCallback) {
        let errors = this.validateLogin(credentials);
        if (errors.length > 0) {
            errorCallback(errors);
        }

        callback({
            Jwt: "FakeJwtStringLongEnoughToPassValidation",
            Nick: "Mocked user",
            Email: credentials.Email,
            UserId: "1234567890123456789012",
        });
    },

    loadCategories: function(jwt, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in"]);
            return;
        }

        callback([
            {
                name: "Fake category 1",
                link_category_id: "38f4f9d5f12a416193a6c22a56d9c142",
                icon_class: "fa fa-plus",
            },
            {
                name: "Fake category 2",
                link_category_id: "6ea6ac0db8114f17ba717145e0990ce7",
                icon_class: "fa fa-credit-card",
            },
            {
                name: "Fake category 3",
                link_category_id: "74bbe5264219493688c75f4cd90b2cf4",
                icon_class: "fa fa-circle",
            },
        ])
    },

    loadLinks: function(jwt, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        callback([
            {
                link_id: "3a01e0b71c514c7a9da53c095b4433a1",
                link_category_id: "38f4f9d5f12a416193a6c22a56d9c142",
                title: "Link in category 1",
                iconClass: "",
                url: "http://www.google.com",
            },
            {
                link_id: "77f83c82b7aa46debdf6c7feea95c2b3",
                link_category_id: "38f4f9d5f12a416193a6c22a56d9c142",
                title: "Link in category 1",
                iconClass: "",
                url: "http://www.google.com",
            },
            {
                link_id: "74270b454331414a953f809bcb63c01a",
                link_category_id: "6ea6ac0db8114f17ba717145e0990ce7",
                title: "Link in category 2",
                iconClass: "",
                url: "http://www.google.com",
            },
            {
                link_id: "5deddfaf1804489fb52f437bfb656765",
                link_category_id: "74bbe5264219493688c75f4cd90b2cf4",
                title: "Link in category 3",
                iconClass: "",
                url: "http://www.google.com",
            },
        ])
    },

    validateLogin: function(credentials) {
        let errors = [];

        if (credentials.ClientId.length != 32) {
            errors.push("Invalid Client ID.");
        }
        if (credentials.Email.length < 4) {
            errors.push("E-mail address is too short.");
        }
        if (credentials.Password.length < 1) {
            errors.push("Please enter password.");
        }

        return errors;
    }
};
