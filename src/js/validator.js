let Validator = {
    validateLogin: function(credentials) {
        let errors = [];

        this._ensureLength(credentials.ClientId, 32, "Invalid Client ID.", errors);
        this._ensureMinLength(credentials.Email, 4, "E-mail address is too short.", errors);
        this._ensureMinLength(credentials.Password, 1, "Please enter password.", errors);

        return errors;
    },
    
    validateLink: function(link) {
        let errors = [];

        this._ensureLength(link.linkCategoryId, 32, "Please specify correct category ID.", errors);
        this._ensureMinLength(link.url, 10, "Please enter URL of link (at least 10 symbols).", errors);

        return errors;
    },

    validateCategory: function(category) {
        let errors = [];

        this._ensureMinLength(category.name, 1, "Please enter category name.", errors);

        return errors;
    },

    ensureCouldModifyLink: function(jwt, ownerId, errorMsg = "You can't modify this link.") {
        let errors = [];

        if (JwtHelper.isValid(jwt) === false) {
            return ["You are not logged in. Please re-login."];
            
        }

        // todo: check owner ID is equal current user ID

        return errors;
    },

    _ensureMinLength: function(s, minLength, errorMsg, errors) {
        if (s == null || s.length < minLength) {
            errors.push(errorMsg);
            return false;
        }
        return true;
    },

    _ensureLength: function(s, length, errorMsg, errors) {
        if (s == null || s.length != length) {
            errors.push(errorMsg);
            return false;
        }
        return true;
    }
};
