opus.user = {
	cookieName: "opus-user",
	userName: "",
	checkLogin: function() {
		//var c = kit.cookie(this.cookieName);
		//console.log(c);
		var info = opus.server.getUserInfo();
		this.userName = info.user;
		return Boolean(this.userName);
	},
	login: function(inUser, inPass) {
		return opus.server.login(inUser, inPass);
	},
	logout: function() {
		return opus.server.logout();
	}
};