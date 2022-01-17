let LogHelper = {
    _log: document.getElementById("Logs"),

    log: function(msg, type = "INFO") {
        let d = new Date();
        let hours = d.getHours() > 9 ? d.getHours() : "0" + d.getHours();
        let minutes = d.getMinutes() > 9 ? d.getMinutes() : "0" + d.getMinutes();
        let seconds = d.getSeconds() > 9 ? d.getSeconds() : "0" + d.getSeconds();
        let s = `${hours}:${minutes}:${seconds} [${type.toUpperCase()}] ${msg}`;
       
        this._log.innerHTML = s + '<br />' + this._log.innerHTML;
    }
};
