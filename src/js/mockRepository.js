let Repository = {
    self: this,

    login: function(credentials, callback, errorCallback) {
        let errors = this.validateLogin(credentials);
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

    validateLogin: function(credentials) {
        let errors = [];

        if (credentials.ClientId.length != 32) {
            errors.push("Invalid Client ID.");
        }
        if (credentials.Email.length < 4) {
            errors.push("E-mail address is too short.");
        }
        if (credentials.Password.length < 1) {
            errors.push("Please enter password.");
        }

        return errors;
    }
};
