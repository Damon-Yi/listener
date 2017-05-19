new function (){
	var _self = this;
	_self.width = 640;//设置默认最大宽度
	_self.fontSize = 100;//默认字体大小
	_self.widthProportion = function(){
        var p = (document.body&&document.body.clientWidth||document.getElementsByTagName("html")[0].offsetWidth)/_self.width;return p<0.5?0.5:(p>0.75?0.75:p);
    };
	
	_self.changePage = function(){
		document.getElementsByTagName("html")[0].setAttribute("style","font-size:"+_self.widthProportion()*_self.fontSize+"px !important");
	}
	_self.changePage();
	window.addEventListener("resize",function(){_self.changePage();},false);
};

/*******/
Config = {
	url:'http://uat.fpk.bqjr.cn/',
//	url:'http://fpk.bqjr.cn/',
	orderType:"ED"
}

//判断设备
function isIOS(){
	var u = navigator.userAgent;
	return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)|| u.indexOf('iOS') > -1; //ios
}
function isAndroid(){
	var u = navigator.userAgent;
	return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1|| u.indexOf('android') > -1; //android
}
//获取信息
function getUserInfo(){
    var userInfo;
    if(Cookie.get("token")){
    	userInfo = '{"token":"'+Cookie.get("token")+'","saNo":"'+Cookie.get("saNo")+'","positionId":"'+Cookie.get("positionId")+'"}';
    }
//  var userInfo = '{"token":"12334678","saNo":"124"}';
    if(isAndroid()){
        userInfo = android2.getTokenAndUserNo(); 
    }else if(isIOS()){
        //userInfo = mobile.token();
    }
    return userInfo?JSON.parse(userInfo):'';
}

/*获取原生退出登录*/
function logOut(){
    if(isAndroid()){
        android2.logOut(); 
    }else if(isIOS()){
        mobile.logOut();
    }
}

//获取GPS坐标
function getGpsNow(){
    if (isAndroid()) {
        android2.gps();
    } else if (isIOS()) {
        mobile.GPS();
    }
}