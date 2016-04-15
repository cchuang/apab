var validateSession = function() {
	if (Cookies.get('seat') == undefined) {
		return false;
	}
	return true;
}

var createSession = function() {
	//check input value here. 
	var patt = /[A-F][0-9]/i;
	if (!patt.test($('#seat').val())) {
		return false;
	}
	Cookies.set('seat', $('#seat').val().toUpperCase(), {expires: 1});
	return true;
}

