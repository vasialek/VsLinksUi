class ComponentVisibility {
    constructor() {
        let self = this;
        self.isLinkEditVisible = ko.observable(true);
        self.isLinkCategoryEditVisible = ko.observable(true);
    }
}

class UserData {
    constructor(userId, nick, email) {
        let self = this;
        self.userId = userId;
        self.nick = nick;
        self.email = email;
        self.isLoggedIn = ko.computed(function () {
            return self.userId != "";
        });
    }
}

class LinkModel {
    constructor(link) {
        let self = this;
        self.linkId = link.link_id;
        self.linkCategoryId = link.link_category_id;
        self.title = link.title;
        self.url = link.url;
        self.rating = link.rating;
        self.isEditable = false;
    }
}

class LinkCategoryModel {
    constructor(linkCategory) {
        let self = this;
        self.linkCategoryId = linkCategory.link_category_id;
        // self.userId = linkCategory.userId;
        self.name = linkCategory.name;
        self.iconClass = linkCategory.icon_class;
    }
}

class ErrorMessage {
    constructor(message, errors) {
        let self = this;
        self.message = message;
        self.errors = errors;
    }
}
