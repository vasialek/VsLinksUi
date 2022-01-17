let Repository = {
    self: this,

    link_categories: [
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
    ],
    links: [
        {
            link_id: "3a01e0b71c514c7a9da53c095b4433a1",
            link_category_id: "38f4f9d5f12a416193a6c22a56d9c142",
            user_id: "99d45738976d4a64acee1356e49044f4",
            title: "Link in category 1",
            iconClass: "",
            url: "http://www.google.com",
            rating: 0,
        },
        {
            link_id: "77f83c82b7aa46debdf6c7feea95c2b3",
            link_category_id: "38f4f9d5f12a416193a6c22a56d9c142",
            user_id: "99d45738976d4a64acee1356e49044f4",
            title: "Link in category 1",
            iconClass: "",
            url: "http://www.google.com",
            rating: 0,
        },
        {
            link_id: "74270b454331414a953f809bcb63c01a",
            link_category_id: "6ea6ac0db8114f17ba717145e0990ce7",
            user_id: "99d45738976d4a64acee1356e49044f4",
            title: "Link in category 2",
            iconClass: "",
            url: "http://www.google.com",
            rating: -1,
        },
        {
            link_id: "5deddfaf1804489fb52f437bfb656765",
            link_category_id: "74bbe5264219493688c75f4cd90b2cf4",
            user_id: "99d45738976d4a64acee1356e49044f4",
            title: "Link in category 3",
            iconClass: "",
            url: "http://www.google.com",
            rating: 2,
        },
    ],

    login: function(credentials, callback, errorCallback) {
        let errors = Validator.validateLogin(credentials);
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

        callback(this.link_categories);
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

        category.link_category_id = "FakeIdOfCategory_00000000000000" + (this.link_categories.length + 1);
        category.icon_class = "fa fa-file";
        this.link_categories.push(category);

        callback(category);
    },

    loadLinks: function(jwt, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        callback(this.links);
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

        link.link_id = "FakeIdOfLink_000000000000000000" + (this.links.length + 1);
        link.rating = 0;
        this.links.push(link);

        callback(link);
    },

    deleteLink: function(jwt, linkId, callback, errorCallback) {
        let errors = Validator.ensureCouldModifyLink(jwt, "NoOwnerIdInLinkObject...");
        if (errors.length > 0) {
            errorCallback(errors);
            return;
        }

        for (let i = 0; i < this.links.length; i++) {
            if (this.links[i].link_id == linkId) {
                let link = this.links[i];
                this.links.splice(i);
                callback(link);
                return;
            }
        }

        errorCallback(["Can't delete non-existing link."]);
    },

    voteLink: function(jwt, linkId, vote, callback, errorCallback) {
        if (JwtHelper.isValid(jwt) == false) {
            errorCallback(["You are not logged in, please re-login."]);
            return;
        }

        if (linkId == null || linkId.length < 1) {
            errorCallback(["Please specify link ID to vote."]);
            return;
        }

        let link = this._getLinkById(linkId);
        if (link == null) {
            errorCallback(["Please specify correct link ID to vote."]);
            return;
        }

        link.rating += vote;
        callback(link);
    },

    _getLinkById: function(linkId) {
        for (let i = 0; i < this.links.length; i++) {
            if (this.links[i].link_id == linkId) {
                return this.links[i];
            }
        }
        return null;
    }
};
