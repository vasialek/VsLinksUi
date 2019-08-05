let pageNr = 1;
let gTemplateLinks = null;
let gTemplateCategoryDropdown = null;

// To debug in console
let gXxx = null;

// var gBaseUrl = "https://vslink-dev.herokuapp.com/api/v1/";
var gBaseUrl = "http://localhost:8079/api/v1/";

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
		gJwt = loginTo();
	}
}

function isValidJwt(jwt) {
	return jwt != null && jwt.length > 32;
}

function loginTo() {
	gJwt = null;
	setMessage("Trying to login...", true, 500);
	doLogin(gClientId, gClientEmail, gClientPassword);
}

function doLogin(clientId, clientEmail, clientPassword) {
	let rq = new XMLHttpRequest();
	rq.open("POST", gBaseUrl + "auth", true);
	rq.onload = function() {
		log("Got response " + rq.status + " (" + rq.statusText + ") from server...");
		if (rq.status == 200) {
			var resp = JSON.parse(rq.responseText);
			// console.log(resp);
			if (resp.status === true) {
				setMessage("Successfully logged in", true, 10000);
				gJwt = resp.jwt;
				let payload = parseJwt(gJwt);
				console.log(payload);
				gUser.Nick = payload.name;
				gUser.Email = payload.email;
				gUser.UserId = payload.user_id;
				initUi();
			}
		} else {
			gJwt = null;
			setMessage("Can't log you in, sorry!", false, 20000);
		}
	}
	rq.onerror = function() {
		log("Could not login to server!", "error");
		setMessage("Could not login to server!", false, 20000);
	}

	let lm = {
		client_id: clientId,
		email: clientEmail,
		password: clientPassword,
	};
	log("Sending: " + JSON.stringify(lm));
	rq.send(JSON.stringify(lm));
}

function setUserInfo(user) {
	document.getElementById("Username").innerHTML = user.Nick;
}

function createLink() {
	log("Going to send link to create...");
	if (isValidJwt(gJwt) == false) {
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
	if (isValidJwt(gJwt) == false) {
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
	if (isValidJwt(gJwt) == false) {
		setMessage("You are not logged in, try to re-open extension", false, 30000);
		return;
	}

	var rq = new XMLHttpRequest();
	rq.open('GET', gBaseUrl + 'links', true);
	setAuthHeader(rq, gJwt);
	rq.onload = function() {
		if (rq.status == 200) {
			setMessage("Links are loaded", true, 2000);
			//log(rq.responseText);
			var resp = JSON.parse(rq.responseText);
			displayLinks(resp);
			
		} else {
			log("Got error from server loading links", "error");
			setMessage("Got error from server loading links", false, 20000);
		}
	};
	rq.onerror = function() {
		log("Could not load links from server!", "error");
		setMessage("Could not load links from server!", false, 20000);
	};
	
	rq.send();
}

function displayLinks(links) {
	let rendered = Mustache.render(gTemplateLinks, {links: links});
	//log("Rendered links to HTML: " + rendered);
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
	if (isValidJwt(gJwt) == false) {
		setMessage("You are not logged in, try to re-open extension", false, 30000);
		return;
	}

	var xhr = new XMLHttpRequest();
	xhr.open('GET', gBaseUrl + 'category', true);
	setAuthHeader(xhr, gJwt);
	xhr.onload = function() {
		log("Got response " + xhr.status + "(" + xhr.statusText + ") on loading link categories");
		if (xhr.status == 200) {
			let categories = JSON.parse(xhr.responseText);
			displayLinkCategories(categories);
		} else {
			log("Got error from server loading link categories", "error");
			setMessage("Got error from server loading link categories", false, 20000);
		}
	}
	xhr.onerror = function() {
		log("Could not load link categories from server!", "error");
		setMessage("Could not load link categories from server!", false, 20000);
	}

	xhr.send();
}

function displayLinkCategories(categories) {
	console.log(categories);
	let rendered = Mustache.render(gTemplateCategoryDropdown, {categories: categories});
	let o = document.getElementById("CategoryId");
	o.innerHTML = rendered;
}

function deleteLink(sender) {
	console.log("Going to delete message:");
	if (isValidJwt(gJwt) == false) {
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


(function defineMustache(global,factory){if(typeof exports==="object"&&exports&&typeof exports.nodeName!=="string"){factory(exports)}else if(typeof define==="function"&&define.amd){define(["exports"],factory)}else{global.Mustache={};factory(global.Mustache)}})(this,function mustacheFactory(mustache){var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(string){return String(string).replace(/[&<>"'`=\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length)}else{nonSpace=true}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n")stripSpace()}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);token=[type,value,start,scanner.pos];tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){value=context.view;names=name.split(".");index=0;while(value!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(value,names[index]);value=value[names[index++]]}}else{value=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit)break;context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.cache={}}Writer.prototype.clearCache=function clearCache(){this.cache={}};Writer.prototype.parse=function parse(template,tags){var cache=this.cache;var tokens=cache[template];if(tokens==null)tokens=cache[template]=parseTemplate(template,tags);return tokens};Writer.prototype.render=function render(template,view,partials){var tokens=this.parse(template);var context=view instanceof Context?view:new Context(view);return this.renderTokens(tokens,context,partials,template)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate);else if(symbol===">")value=this.renderPartial(token,context,partials,originalTemplate);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate)};Writer.prototype.renderPartial=function renderPartial(token,context,partials){if(!partials)return;var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null)return this.renderTokens(this.parse(value),context,partials,value)};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return mustache.escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};mustache.name="mustache.js";mustache.version="2.3.0";mustache.tags=["{{","}}"];var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials)};mustache.to_html=function to_html(template,view,partials,send){var result=mustache.render(template,view,partials);if(isFunction(send)){send(result)}else{return result}};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer;return mustache});
