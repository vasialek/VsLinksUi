let JwtHelper = {
    isValid: function (jwt) {
        return jwt != null && jwt.length > 32;
    }
};
