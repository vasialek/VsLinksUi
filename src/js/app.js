function AppViewModel() {
    let self = this;

    // Data
    self.jwt = "";
    self.userData = ko.observable(new UserData("", "Not logged in", ""));
    self.links = ko.observableArray([]);
    self.linkCategories = ko.observableArray([]);

    // Objects to edit/create
    self.linkToEdit = ko.observable(new LinkModel({}));
    self.linkCategoryToEdit = ko.observable(new LinkCategoryModel({}));

    // Visibility
    self.componentVisibility = new ComponentVisibility();

    // UI
    self.errorMessage = ko.observable(new ErrorMessage("", []));
    self.myErrorMessage = ko.observable(new ErrorMessage("", []));

    self.init = function() {
        LogHelper.log("Starting...");
        console.log("Initializing App view model...");
        let credentials = {
            ClientId: "xCWZP3MzZcJawrHTysBk8catMctPK3Fr",
            Email: "proglamer@gmail.com",
            Password: "123456"
        };
        Repository.login(credentials, function(user) {
            console.log("User is logged in");
            console.log(user);
            self.userData(new UserData(user.UserId, user.Nick, user.Email));
            self.jwt = user.Jwt;
            self.loadAllData();
        }, function(errors) {
            self.errorMessage = new ErrorMessage("Error logging in.", errors);
        });
    };

    self.loadAllData = function() {
        self.loadLinkCategories();
        self.loadLinks();
    };

    // Event handlers
    self.onVoteUpClicked = function(link) {
        self.voteLink(link, 1);
    };

    self.onVoteDownClicked = function(link) {
        self.voteLink(link, -1);
    };

    self.onDeleteLinkClicked = function(link) {
        LogHelper.log("Delete link is clicked...");
        console.log(link);
        self.deleteLink(link);
    };

    self.onEditLinkClicked = function(link) {
        LogHelper.log("Edit link is clicked...");
        console.log(link);
        link.isEditable = true;
        link.title = "fdsfdsfd";
        self.links.replace(link, new LinkModel(link));
    };

    // Links
    self.loadLinks = function() {
        Repository.loadLinks(self.jwt, function(links) {
            console.table(links);
            let ar = [];
            links.forEach(link => {
                ar.push(new LinkModel(link));
            });
            self.links(ar);
        }, function(errors) {
            self.showErrorMessage("Can't load links from server.", errors, 10);
        });
    };

    self.createLink = function() {
        console.log("Link to edit:");
        console.log(self.linkToEdit());
        let link = {
            linkCategoryId: self.linkToEdit().linkCategoryId.linkCategoryId,
            title: self.linkToEdit().title,
            url: self.linkToEdit().url,
        }
        Repository.createLink(self.jwt, link, function(link) {
            console.log("Link is created: ");
            console.log(link);
            self.links.push(link);
        }, function(errors) {
            self.showErrorMessage("Error creating link", errors, 20);
        });
    };

    self.deleteLink = function(linkToDelete) {
        Repository.deleteLink(self.jwt, linkToDelete.linkId, function(link) {
            LogHelper.log("Link was deleted (" + link.linkId + ").");
            self.links.remove(linkToDelete);
        }, function(errors) {
            self.showErrorMessage("Error deleting link.", errors, 30);
        });
    };

    self.voteLink = function(linkToUpdate, vote) {
        console.log("voteLink: linkId: " + linkToUpdate.linkId);
        Repository.voteLink(self.jwt, linkToUpdate.linkId, vote, function(link) {
            console.log("Link was voted OK:");
            console.log(link);
            self.links.replace(linkToUpdate, new LinkModel(link));
            // self.updateLinkInList(link);
        }, function(errors) {
            self.showErrorMessage("Error voting for link.", errors, 30);
        });
    };

    self.updateLinkInList = function(link) {
        let linkToUpdate = self._getLinkById(link.linkId);
        console.log("Got link to update votes:");
        console.log(linkToUpdate);
        if (linkToUpdate != null) {
            self.links.replace(linkToUpdate, link);
        }
        // let index = self.links.indexOf(link);
        // self.links.replace(self.links[index], {
        //     linkId: link.linkId,
        //     title: link.title,
        //     rating: link.rating,
        // });
        // self.links.splice(index, 1);
        // self.links.splice(index, 0, link);
    };

    self._getLinkById = function(linkId) {
        console.log("Link ID to find: " + linkId);
        let ar = self.links();
        ar.forEach(link => {
            if (link.linkId == linkId) {
                return link;
            }
        });
        return null;
    };

    // Link Categories
    self.loadLinkCategories = function() {
        Repository.loadCategories(self.jwt, function (categories) {
            console.log("Got link categories from server...");
            console.log(categories);
            let ar = [];
            categories.forEach(category => {
                ar.push(new LinkCategoryModel(category));
            });
            self.linkCategories(ar);
        }, function (errors) {
            self.showErrorMessage("Got error from server loading link categories", errors, 20);
        });
    };

    self.createLinkCategory = function() {
        console.log("Create link category:");
        console.log(self.linkCategoryToEdit());
        // self.showErrorMessage("dfdsfdsf", [], 20);
        let category = {
            name: self.linkCategoryToEdit().name
        };
        Repository.createCategory(self.jwt, category, function(category) {
            console.log("Category is created:");
            console.log(category);
            let ar = self.linkCategories();
            console.log(ar);
            ar.push(new LinkCategoryModel(category));
            console.log(ar);
            self.linkCategories(ar);
        }, function(errors) {
            self.showErrorMessage("Error creating link category.", errors, 20);
        });
    };

    // Toggle views
    self.showLinkEdit = function() {
        self.componentVisibility.isLinkEditVisible(true);
    };

    self.cancelLinkEdit = function() {
        self.componentVisibility.isLinkEditVisible(false);
    };

    self.showLinkCategoryEdit = function() {
        self.componentVisibility.isLinkCategoryEditVisible(true);
    };

    self.cancelLinkCategoryEdit = function() {
        self.componentVisibility.isLinkCategoryEditVisible(false);
    }

    self.showErrorMessage = function(msg, errors, timeoutS) {
        self.myErrorMessage(new ErrorMessage(msg, errors));
        if (timeoutS > 0) {
            setTimeout(function() {
                self.myErrorMessage(new ErrorMessage("", ""));
            }, timeoutS * 1000);
        }
    };

    self.clearErrorMessage = function() {
        self.myErrorMessage(new ErrorMessage("", []));
    };
};


let viewModel = new AppViewModel();
ko.applyBindings(viewModel);
viewModel.init();
