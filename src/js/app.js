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
        self.loadLinks(null);
    };

    self.onTestClicked = function() {
        LogHelper.log("TEST clicked...");
        new LinkRepository().loadLinks(self.jwt, null, function (links) {
            console.table(links);
            let ar = [];
            links.forEach(link => ar.push(link));
            self.links(ar);
        }, function (errors) {
            self.showErrorMessage("Failed to load links", errors, 20);
        })
    };

    // Event handlers
    self.onFilterCategoryClicked = function(linkCategory) {
        // console.log(linkCategory);
        self.loadLinks(linkCategory);
    };

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
        LogHelper.log(`Edit link is clicked. ${JSON.stringify(link)}`);
        link.isEditable(true);
    };

    self.onUpdateLinkClicked = function(link) {
        LogHelper.log("Update link is clicked...");
        self.updateLink(link);
    }

    self.updateLink = function(link) {
        LogHelper.log(JSON.stringify(link));
        link.isEditable(false);
        self.updateLinkInList(link);
        Repository.updateLink(self.jwt, link, function (link) {
            LogHelper.log(`Link with ID ${link.link_id} is updated`);
        }, function (errors) {
            self.showErrorMessage("Can't update link on server", errors, 30);
        });
    }

    self.onCancelUpdateLinkClicked = function(link) {
        LogHelper.log("Cancel link is clicked");
        link.isEditable(false);
    }

    // Links
    self.loadLinks = function(linkCategory) {
        let linkCategoryId = null;
        if (linkCategory != null) {
            LogHelper.log(`Filtering by category '${linkCategory.name}' (ID: ${linkCategory.linkCategoryId})`);
            linkCategoryId = linkCategory.linkCategoryId;
        }

        Repository.loadLinks(self.jwt, linkCategoryId, function(links) {
            let ar = [];
            links.forEach(link => {
                ar.push(link);
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
            self.links.push(new LinkModel(link));
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
        LogHelper.log("voteLink: linkId: " + linkToUpdate.linkId);
        Repository.voteLink(self.jwt, linkToUpdate.linkId, vote, function(link) {
            self.updateLinkInList(link);
        }, function(errors) {
            self.showErrorMessage("Error voting for link.", errors, 30);
        });
    };

    self.updateLinkInList = function(linkToUpdate) {
        if (linkToUpdate != null) {
            let links = [];
            self.links.removeAll()
                .forEach(link => {
                    if (link.linkId === linkToUpdate.linkId) {
                        links.push(linkToUpdate)
                    } else {
                        links.push(link);
                    }
                });
            self.links(links);

        }
    };

    // Link Categories
    self.loadLinkCategories = function() {
        new LinkCategoryRepository().loadCategories(self.jwt, function (categories) {
            LogHelper.log("Got link categories from server...");
            // LogHelper.log(JSON.stringify(categories));
            let ar = [];
            categories.forEach(category => ar.push(category));
            self.linkCategories(ar);
        }, function (errors) {
            self.showErrorMessage("Got error from server loading link categories", errors, 20);
        });
    };

    self.createLinkCategory = function() {
        console.log("Create link category:");
        console.log(self.linkCategoryToEdit());
        let category = {
            name: self.linkCategoryToEdit().name
        };
        Repository.createCategory(self.jwt, category, function(category) {
            LogHelper.log(`Category is created: ${JSON.stringify(category)}`);
            let ar = self.linkCategories();
            // console.log(ar);
            ar.push(new LinkCategoryModel(category));
            // console.log(ar);
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
}


let viewModel = new AppViewModel();
ko.components.register("vs-link-editor", {
    viewModel: function (params) {
        let self = this;
        self.link = params.link || {};
        this.linkCategories = params.linkCategories;
        this.title = ko.observable(self.link.title);
        this.url = ko.observable(self.link.url);
        this.linkCategoryId = ko.observable(self.link.linkCategoryId);

        this.onUpdateClicked = function () {
            // console.log(`${JSON.stringify(self.link)}`);
            self.link.title = self.title();
            self.link.url = self.url();
            self.link.linkCategoryId = self.linkCategoryId().linkCategoryId;
            viewModel.updateLink(self.link);
        }

        this.onCancelClicked = function () {
            viewModel.onCancelUpdateLinkClicked(self.link);
        }
    },
    template: {element: "vs-link-editor-template"}
});

let options = {
    attribute: "data-bind",        // default "data-sbind"
    globals: window,               // default {}
    bindings: ko.bindingHandlers,  // default ko.bindingHandlers
    noVirtualElements: false       // default true
};
ko.bindingProvider.instance = new ko.secureBindingsProvider(options);

ko.applyBindings(viewModel);
viewModel.init();
