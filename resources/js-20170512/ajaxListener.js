(function(){
    var open = window.XMLHttpRequest.prototype.open,
    send = window.XMLHttpRequest.prototype.send,
    onReadyStateChange;

    var locData = {};//当localstorage不可用时,存储数据

    var sendDataObj = {},
        locaDataStr = 'reqData',
        serverPath = 'http://bdc.bqjr.cn/behavior/monitoring',//提交地址
        //serverPath = 'http://10.80.2.46:8888/bqjr-behavior/behavior/monitoring',//提交地址
        sending = false,
        deviceInfo,//设备信息
        chennelStr='FCM';//渠道

    var excludeUrl = ['zhugeio.com','umeng.com'];//排除链接

    function openReplacement(method, url, async, user, password) {
        var syncMode = async !== false ? 'async' : 'sync';
        sendDataObj.method = method;
        sendDataObj.url = url.replace(/&/g,'#');//url encode,&符号特殊
        //this.setRequestHeader('token','123');
        return open.apply(this, arguments);//继承open对象中的属性和方法
    }

    function sendReplacement(data) {
        if(this.onreadystatechange) {
            this._onreadystatechange = this.onreadystatechange;
        }
        this.onreadystatechange = onReadyStateChangeReplacement;
        sendDataObj.data = data;

        //console.log(arguments[0]);
        var flag = true;//屏蔽链接
        for(var i=0;i<excludeUrl.length;i++){
            if(sendDataObj.url.indexOf(excludeUrl[i])>=0){
                flag = false;
            }
        }
        /*try{
            if(flag&&isAndroid()){//数据发送给安卓
                //console.log('send..');
                android.uploadData(JSON.stringify(sendDataObj));
            } 
        }catch(err){
           console.log('android2 error');
        }*/
        if(flag){//缓存数据
            if(sendDataObj.url.indexOf(serverPath)<0){
                try{
                    locStorage.set(sendDataObj.url,sendDataObj);
                }catch(err){
                   console.log(err);
                }
            }
        } 
        return send.apply(this, arguments);
    }

    function onReadyStateChangeReplacement() {
        if(this._onreadystatechange&&this.readyState==4) {
        //console.log(this.getAllResponseHeaders());
            if(this.getResponseHeader("Content-Type")&&this.getResponseHeader("Content-Type").indexOf('application/json')>=0){
                if(this.responseText){
                    var obj = eval('('+this.responseText+')');
                    // console.log(this.responseText);
                }
            }
            //console.log(arguments);
            return this._onreadystatechange.apply(this, arguments);
        }
    }
    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;

    //判断设备
    function isIOS(){
        var u = navigator.userAgent;
        return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)|| u.indexOf('iOS') > -1; //ios
    }
    function isAndroid(){
        var u = navigator.userAgent;
        return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1|| u.indexOf('android') > -1; //android
    }
    //localStorage操作
    var locStorage = {
        insert:function(key,data){
            if(localStorage){
                var bData = JSON.parse(localStorage.getItem(key));
                bData = bData?bData:{
                    reqInfo:[]
                };
                bData.reqInfo.push(data);
                localStorage.setItem(key,JSON.stringify(bData));

                sendData(key);
            }
        },
        set:function(key,data){
            if(localStorage){
               localStorage.setItem(key,JSON.stringify(data));
            }else{
               locData[key] = JSON.stringify(data);
            }
            //console.log('----------------'+JSON.stringify(locData));
            sendData(key); 
        },
        get:function(key){
            if(localStorage){
                return JSON.parse(localStorage.getItem(key));
            }else{
                return locData[key]?locData[key]:null;
            }
        },
        remove:function(key){
            if(localStorage){
                localStorage.removeItem(key);
            }else{
                delete locData[key];
                //console.log('----------------'+JSON.stringify(locData));
            }
        }
    }
    //Cookie 操作
    var Cookie = {
        getExpiresDate:function(days, hours, minutes) {
            var ExpiresDate = new Date();
            if (typeof days == "number" && typeof hours == "number" &&
                typeof hours == "number") {
                ExpiresDate.setDate(ExpiresDate.getDate() + parseInt(days));
                ExpiresDate.setHours(ExpiresDate.getHours() + parseInt(hours));
                ExpiresDate.setMinutes(ExpiresDate.getMinutes() + parseInt(minutes));
                return ExpiresDate.toGMTString();
            }
        },
        _getValue:function(offset) {
            var endstr = document.cookie.indexOf (";", offset);
            if (endstr == -1) {
                endstr = document.cookie.length;
            }
            return unescape(document.cookie.substring(offset, endstr));
        },
        get:function(name) {
            var arg = name + "=";
            var alen = arg.length;
            var clen = document.cookie.length;
            var i = 0;
            while (i < clen) {
                var j = i + alen;
                if (document.cookie.substring(i, j) == arg) {
                    return this._getValue(j);
                }
                i = document.cookie.indexOf(" ", i) + 1;
                if (i == 0) break;
            }
            return "";
        },
        set:function(name, value, expires, path, domain, secure) {
            document.cookie = name + "=" + escape (value) +
                ((expires) ? ";expires=" + expires : "") +
                ((path) ? ";path=" + path : "") +
                ((domain) ? ";domain=" + domain : "") +
                ((secure) ? ";secure" : "");
        },
        remove:function(name,path,domain) {
            if (this.get(name)) {
                document.cookie = name + "=" +
                    ((path) ? ";path=" + path : "") +
                    ((domain) ? ";domain=" + domain : "") +
                    ";expires=Thu, 01-Jan-70 00:00:01 GMT";
            }
        },
        clear:function(){
            var cookies = document.cookie.split(';');
            for(var i=0; i < cookies.length; i++){
                var cookieName = cookies[i].split('=')[0];
                if(cookieName.trim()){
                    this.remove(cookieName.trim());
                }
            }
        }
    }
    //发送数据
    function getXMLHttpRequest() {  
        var xhr;  
        if(window.ActiveXObject) {  
            xhr= new ActiveXObject("Microsoft.XMLHTTP");  
        }else if (window.XMLHttpRequest) {  
            xhr= new XMLHttpRequest();  
        }else {  
            xhr= null;  
        }  
        return xhr;  
    }
    var sendData = function(key){
        try{
            //console.log('key:'+key);
            var tmpData = locStorage.get(key);
            if(tmpData&&!sending){
                //tmpData.data = tmpData.data.replace(/&/g,'#');//url encode,&符号特殊
                var xhr = getXMLHttpRequest(), 
                    userId = Cookie.get('user_id'),
                    params ='userId='+userId+'&h5Json='+JSON.stringify(tmpData)+'&chennel='+chennelStr+'&createDate='+new Date();
                var time = delayTime(5);
                //console.log(time);
                if(xhr){
                    setTimeout(function(){//避免同时提交请求
                        //console.log(locStorage.get(key));
                        locStorage.remove(key);
                        //console.log(locStorage.get(key));
                        xhr.open("post",serverPath);  
                        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
                        xhr.send(params); 
                        sending = true; 
                        xhr.onreadystatechange= function() {  
                            if(xhr.readyState == 4 && xhr.status == 200) {  
                                var data = JSON.parse(xhr.response);
                                sending = false; 
                                if(data.ask==0){
                                }
                            }  
                        };
                    },time);
                }
            }
        }catch(err){
            console.log(err);
        }
    }
    function delayTime(num){
        return Math.round(Math.random()*num+1)*1000;
    }
    function getReferrer(){
        var referrer = '';
        try {
            referrer = window.top.document.referrer;
        } catch(e) {
            if(window.parent) {
                try {
                    referrer = window.parent.document.referrer;
                } catch(e2) {
                    referrer = '';
                }
            }
        }
        if(referrer === '') {
            referrer = document.referrer;
        }
        return referrer;
    }
    window.addEventListener("load",function(){
        //locStorage.set(locaDataStr,{"method":"get","url":getReferrer(),"data":""});
        var url = location.href;
        url = url.replace(/&/g,'#');//url encode,&符号特殊
        try{
            locStorage.set(location.href,{"method":"get","url":url,"data":""});
        }catch(err){
           console.log(err);
        }
    });
})();