function ComponentVisibility() {
    let self = this;
    self.isLinkEditVisible = ko.observable(true);
    self.isLinkCategoryEditVisible = ko.observable(true);
}

function UserData(userId, nick, email) {
    let self = this;
    self.userId = userId;
    self.nick = nick;
    self.email = email;
    self.isLoggedIn = ko.computed(function() {
        return self.userId != "";
    });
}

function LinkModel(link) {
    let self = this;
    self.linkId = link.link_id;
    self.linkCategoryId = link.link_category_id;
    self.title = link.title;
    self.url = link.url;
    self.rating = link.rating;
    self.isEditable = false;
}

function LinkCategoryModel(linkCategory) {
    let self = this;
    self.linkCategoryId = linkCategory.link_category_id;
    // self.userId = linkCategory.userId;
    self.name = linkCategory.name;
    self.iconClass = linkCategory.icon_class;
}

function ErrorMessage(message, errors) {
    let self = this;
    self.message = message;
    self.errors = errors;
}
