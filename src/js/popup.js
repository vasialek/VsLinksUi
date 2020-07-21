let pageNr = 1;
let gTemplateLinks = null;
let gTemplateCategoryDropdown = null;
let gTemplateFilterCategories = null;

// To debug in console
let gXxx = null;

// Links and Categories from DB
let gLinks = [];
let gCategories = [];

var gBaseUrl = "https://vslink-dev.herokuapp.com/api/v1/";
// var gBaseUrl = "http://localhost:8079/api/v1/";

let gJwt = null;
// Login information
let gClientId = "xCWZP3MzZcJawrHTysBk8catMctPK3Fr";
let gClientEmail = "proglamer@gmail.com";
let gClientPassword = "xEHdaERHMev2";

let gUser = {
	Nick: "",
	Email: "",
	UserId: "",
};

document.addEventListener('DOMContentLoaded', () => {
	init();

	validateJwt();
	// loadLinks();
});

function init() {
	setMessage("Loading...", true, 0);
	log("Working with API server " + gBaseUrl);

	gTemplateLinks = document.getElementById("template").innerHTML
	Mustache.parse(gTemplateLinks);   // optional, speeds up future uses

	gTemplateCategoryDropdown = document.getElementById("TemplateCategoriesDropdown").innerHTML;
	Mustache.parse(gTemplateCategoryDropdown);

	gTemplateFilterCategories = document.getElementById("TemplateFilterCategories").innerHTML;
	Mustache.parse(gTemplateFilterCategories);

	document.getElementById("List").className = "hidden";
	document.getElementById("New").className = "hidden";
	document.getElementById("NewCategory").className = "hidden";
	
	document.getElementById("BtnShowCreate").addEventListener("click", function() {
		document.getElementById("New").className = "visible";
		document.getElementById("Title").focus();
    });
    document.getElementById("BtnCancel").addEventListener("click", function () {
        cancelCreate();
    });
	document.getElementById("BtnCreate").addEventListener("click", function () {
		createLink();
	});
	
	document.getElementById("BtnShowCreateCategory").addEventListener("click", function() {
		document.getElementById("NewCategory").className = "form-inline visible";
		document.getElementById("CategoryName").focus();
    });
    document.getElementById("BtnCancelCategory").addEventListener("click", function () {
        cancelCreateCategory();
    });
	document.getElementById("BtnCreateCategory").addEventListener("click", function () {
		createCategory();
	});

	document.getElementById("BtnRefresh").addEventListener("click", function () {
		loadLinks();
	});
}

function initUi() {
	if (gUser.UserId !== "") {
		log("Successfully logged in as " + gUser.Nick);
		setUserInfo(gUser);
		loadLinkCategories();
	}
}

function validateJwt() {
	if (gJwt == null) {
		loginTo();
	}
}

function loginTo() {
	gJwt = null;
	setMessage("Trying to login...", true, 500);
	Repository.login({
		ClientId: gClientId, 
		Email: gClientEmail, 
		Password: gClientPassword}, function (user) {
			setMessage("Logged in", true, 10000);
			gJwt = user.Jwt;
			gUser = user;
			log("JWT: " + gJwt);
			initUi();
		}, function (errors) {
			setMessage("Error logging in.", false, 30000);
			gJwt = null;
		});
}

function setUserInfo(user) {
	document.getElementById("Username").innerHTML = user.Nick;
}

function createLink() {
	log("Going to send link to create...");
	if (JwtHelper.isValid(gJwt) == false) {
		setMessage("You are not logged in, try to re-open extension", false, 30000);
		return;
	}
	let link = {
		link_category_id: document.getElementById("CategoryId").value,
		title: document.getElementById("Title").value,
		url: document.getElementById("Url").value
	}
	console.log(link);
	if (validateLink(link) == false) {
		return;
	}

	var rq = new XMLHttpRequest();
	rq.open('POST', gBaseUrl + 'links', true);
	setAuthHeader(rq, gJwt);
	rq.onload = function() {
		if (rq.status == 200) {
			setMessage("Link is created", true, 2000);
			log(rq.responseText);
			var resp = JSON.parse(rq.responseText);
			
		} else {
			log("Got error from server saving link", "error");
			setMessage("Got error from server saving link", false, 20000);
		}
	};
	rq.onerror = function() {
		log("Could not save link on server!", "error");
		setMessage("Could not save link on server!", false, 20000);
	};
	
	rq.send(JSON.stringify(link));
}

function cancelCreate() {
    document.getElementById("New").className = "hidden";
    document.getElementById("Title").value = "";
    document.getElementById("Url").value = "";
    document.getElementById("CategoryId").value = "0";
}

function createCategory() {
	let categoryName = document.getElementById("CategoryName").value;
	log("Going to create category: " + categoryName);
	if (JwtHelper.isValid(gJwt) == false) {
		setMessage("You are not logged in, try to re-open extension", false, 30000);
		return;
	}

	var xhr = new XMLHttpRequest();
	xhr.open("POST", gBaseUrl + "category");
	setAuthHeader(xhr, gJwt);
	xhr.onload = function() {
		log("Got response " + xhr.status + "(" + xhr.statusText + ") on Link Category create.");
		if (xhr.status == 200) {
			setMessage("Category is created.", true, 20000);
		} else {
			log("Got error from server saving category", "error");
			setMessage("Got error from server saving category", false, 20000);
		}
	};
	xhr.onerror = function() {
		log("Could not save category on server!", "error");
		setMessage("Could not save category on server!", false, 20000);
	};

	xhr.send(JSON.stringify({
		name: categoryName
	}));
}

function cancelCreateCategory() {
    document.getElementById("NewCategory").className = "hidden";
    document.getElementById("CategoryName").value = "";
}


function validateLink(link) {
	if (link.url.length < 10) {
		setMessage("Please enter URL of link", false, 30000);
		return false;
	}
	
	return true;
}

function loadLinks() {
	log("Going to load links...");
	log("JWT: " + gJwt);
	Repository.loadLinks(gJwt, function(links) {
		gLinks = links;
		displayLinks(gLinks);
	}, function(errors) {
		log("Got error from server loading links", "error");
		console.log(errors);
		setMessage("Got error from server loading links", false, 20000);
	});
	// if (JwtHelper.isValid(gJwt) == false) {
	// 	setMessage("You are not logged in, try to re-open extension", false, 30000);
	// 	return;
	// }

	// var rq = new XMLHttpRequest();
	// rq.open('GET', gBaseUrl + 'links', true);
	// setAuthHeader(rq, gJwt);
	// rq.onload = function() {
	// 	if (rq.status == 200) {
	// 		setMessage("Links are loaded", true, 2000);
	// 		gLinks = JSON.parse(rq.responseText);
	// 		displayLinks(gLinks);
			
	// 	} else {
	// 		log("Got error from server loading links", "error");
	// 		setMessage("Got error from server loading links", false, 20000);
	// 	}
	// };
	// rq.onerror = function() {
	// 	log("Could not load links from server!", "error");
	// 	setMessage("Could not load links from server!", false, 20000);
	// };
	
	// rq.send();
}

function displayLinks(links) {
	let rendered = Mustache.render(gTemplateLinks, {links: links, "iconClass": function () {
		const category = getLinkCategoryById(this.link_category_id);
		return category.icon_class == "" ? "fa fa-link" : category.icon_class;
	}});

	let o = document.getElementById("List");
	o.innerHTML = rendered;
	o.className = "visible";
	
	var deleteButtons = document.getElementsByClassName("vl-btn-delete");
	var editButtons = document.getElementsByClassName("vl-btn-edit");
	for (var i = 0; i < deleteButtons.length; i++) {
		deleteButtons[i].addEventListener('click', function () {
			deleteLink(this);
		}, false);
	}
	for (var i = 0; i < editButtons.length; i++) {
		editButtons[i].addEventListener('click', function () {
			editLink(this);
		}, false);
	}

}

function loadLinkCategories() {
	log("Going to load link categories...");
	Repository.loadCategories(gJwt, function (categories) {
		log("Got link categories from server...");
		console.log(categories);
		gCategories = categories;
		displayLinkCategories(gCategories);
		displayFilterCategories(gCategories);
	}, function (errors) {
		setMessage("Got error from server loading link categories", false, 20000);
	});
}

// function loadLinkCategories() {
// 	log("Going to load link categories...");
// 	if (JwtHelper.isValid(gJwt) == false) {
// 		setMessage("You are not logged in, try to re-open extension", false, 30000);
// 		return;
// 	}

// 	var xhr = new XMLHttpRequest();
// 	xhr.open('GET', gBaseUrl + 'category', true);
// 	setAuthHeader(xhr, gJwt);
// 	xhr.onload = function() {
// 		log("Got response " + xhr.status + "(" + xhr.statusText + ") on loading link categories");
// 		if (xhr.status == 200) {
// 			gCategories = JSON.parse(xhr.responseText);
// 			displayLinkCategories(gCategories);
// 			displayFilterCategories(gCategories);
// 		} else {
// 			log("Got error from server loading link categories", "error");
// 			setMessage("Got error from server loading link categories", false, 20000);
// 		}
// 	}
// 	xhr.onerror = function() {
// 		log("Could not load link categories from server!", "error");
// 		setMessage("Could not load link categories from server!", false, 20000);
// 	}

// 	xhr.send();
// }

function displayLinkCategories(categories) {
	let rendered = Mustache.render(gTemplateCategoryDropdown, {categories: categories});
	let o = document.getElementById("CategoryId");
	o.innerHTML = rendered;
}

function displayFilterCategories(categories) {
	let rendered = Mustache.render(gTemplateFilterCategories, {categories: categories});
	document.getElementById("FilterCategory").innerHTML = rendered;

	// Apply filtering to icons
	initFilterActions();
}

function initFilterActions() {
	let icons = document.getElementsByClassName("vl-filter");
	log("Initializing filter " + icons.length + " icons");
	for (let i = 0; icons != null && i < icons.length; i++) {
		const icon = icons[i];
		icon.addEventListener("click", function () {
			onFilterCategoryClicked(icon);
		});
	}
}

function onFilterCategoryClicked(element) {
	let uid = getUidFromElement(element);
	filterLinksByCategory(uid);
}

function filterLinksByCategory(categoryId) {
	const category = getLinkCategoryById(categoryId);
	if (category == null) {
		setMessage("Incorrect category to filter.", false, 10000);
		return;
	}

	if (gLinks.length == 0) {
		loadLinks();
	}

	let filtered = [];
	setMessage(`Filtering by ${category.name}`, true, 1000);
	for (let i = 0; i < gLinks.length; i++) {
		if (gLinks[i].link_category_id == categoryId) {
			filtered.push(gLinks[i]);
		}
	}

	displayLinks(filtered);
}

function deleteLink(sender) {
	console.log("Going to delete message:");
	if (JwtHelper.isValid(gJwt) == false) {
		setMessage("You are not logged in, try to re-open extension", false, 30000);
		return;
	}

	console.log(sender);
	gXxx = sender;
	let uid = getUidFromElement(sender);
	log("Going to delete link with UID: " + uid);
	
	var xhr = new XMLHttpRequest();
	xhr.open("DELETE", gBaseUrl + "links/" + uid);
	setAuthHeader(xhr, gJwt);
	xhr.onload = function() {
		log("Got response " + xhr.status + " (" + xhr.statusText + ") from API server");
		if (xhr.status == 200) {
			deleteRowByButton(sender);
		} else {
			setMessage("Error deleting link from server. " + xhr.response, false, 60000);
		}
	};
	xhr.onerror = function() {
		log("Gto error response on deleting link", "ERROR");
	};

	xhr.send();
}

function editLink(sender) {
	console.log("Going to edit message:");
	console.log(sender);
}

function clearMessage() {
	let o = document.getElementById("Msg");
	o.textContent = "";
	o.className = "hidden";
}

function setMessage(msg, isOk, ttlMs = 0) {
	let o = document.getElementById("Msg");
	o.textContent = msg;
	o.className = isOk ? "alert alert-success" : "alert alert-danger";
	if (ttlMs > 0) {
		window.setTimeout(clearMessage, 60000);
	}
}

function log(msg, type = "INFO") {
	let d = new Date();
	let s = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "[" + type.toUpperCase() + "] " + msg;
	
	let log = document.getElementById("Logs");
	log.innerHTML = s + '<br />' + log.innerHTML;
}

// #region Helpers

function getLinkCategoryById(categoryId) {
	for (let i = 0; i < gCategories.length; i++) {
		const category = gCategories[i];
		if (category.link_category_id == categoryId) {
			return category;
		}
	}
	return {};
}

function deleteRowByButton(btn) {
	btn.parentNode.parentNode.remove();
}

function getUidFromElement(el) {
	return el.attributes["data-uid"].value;
}

function parseJwt (jwt) {
    var base64Url = jwt.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var payload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(payload);
};

function setAuthHeader(xhr, jwt) {
	if (xhr != null) {
		let h = "Bearer " + jwt;
		console.log("Set Authorization header to: " + h);
		xhr.setRequestHeader("Authorization", h);
	}
}

// #endregion
