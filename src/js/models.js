class ComponentVisibility {
    constructor() {
        this.isLinkEditVisible = ko.observable(false);
        this.isLinkCategoryEditVisible = ko.observable(false);
    }
}

class UserData {
    constructor(userId, nick, email) {
        this.userId = userId;
        this.nick = nick;
        this.email = email;
        const self = this;
        this.isLoggedIn = ko.computed(function () {
            return self.userId != "";
        });
    }
}

class LinkModel {
    constructor(link) {
        const self = this;
        this.linkId = link.link_id;
        this.linkCategoryId = link.link_category_id;
        this.title = link.title;
        this.url = link.url;
        this.rating = link.rating;
        this.iconClass = ""; //link.icon_class;
        this.isEditable = ko.observable(false);
        this.isReadMode = ko.computed(function() {
            return self.isEditable() == false;
        });
    }
}

class LinkCategoryModel {
    constructor(linkCategory) {
        this.linkCategoryId = linkCategory.link_category_id;
        // this.userId = linkCategory.userId;
        this.name = linkCategory.name;
        this.iconClass = linkCategory.icon_class;
    }
}

class ErrorMessage {
    constructor(message, errors) {
        this.message = message;
        this.errors = errors;
    }
}
