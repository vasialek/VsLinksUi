let JwtHelper = {
    isValid: function(jwt) {
        if (jwt == null || jwt.length < 3) {
            return false;
        }
        let dotCount = (jwt.match(/\./g) || []).length;
        console.log("Dots in JWT: " + dotCount);
        return dotCount == 2;
    },

    parseJwt: function(jwt) {
        try {
            let base64Url = jwt.split('.')[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            let payload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        
            return JSON.parse(payload);
        } catch (error) {
            console.log(error);
        }

        return {};
    }
}
