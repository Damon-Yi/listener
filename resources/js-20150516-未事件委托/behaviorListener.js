(function(){
    var requestDataPath = 'http://bdc.bqjr.cn/behavior/monitoring',
        inputDataPath = 'http://bdc.bqjr.cn/behavior/inputMonitoring',
        confData;
    //当前js所在绝对路径
    var currJsPath = (function(){
        var js = document.scripts;
        return js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/") + 1);
    })();

    //获取XMLHttpRequest对象
    var getXMLHttpRequest = function () {  
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
    //判断设备
    function isIOS(){
        var u = navigator.userAgent;
        return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)|| u.indexOf('iOS') > -1; //ios
    }
    function isAndroid(){
        var u = navigator.userAgent;
        return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1|| u.indexOf('android') > -1; //android
    }
    //读取配置文件
    var getConfData = function(callBack){
        var xhr = getXMLHttpRequest(); 
        if(xhr){
            /*
             * 1、"请求数据"：用户发送http请求被拦截的数据(URL、请求方式、参数、当前时间);同步发送+异步发送
             * 2、"行为数据"：用户输入框操作产生的数据(修改前的值、修改后的值、开始时间、结束时间、控件ID、控件Name、控件类型、控件所在页面URL、结束触发事件);异步发送
             * 3、异步发送：数据存储在localstorage中(android2.1版本以上，在无法写入localstorage情况下，需要webview配置启用缓存)
             * 4、userId：从cookie中获取
             */
            try{
                //xhr.open("get",currJsPath+'conf.js');  
                xhr.open("get",currJsPath+'conf.json',true);  
                xhr.send(); 
                sending = true; 
                xhr.onreadystatechange = function() {  
                    if(xhr.readyState == 4 && xhr.status == 200){  
                        config = JSON.parse(xhr.response);
                        callBack(config);
                    }
                };
            }catch(err){
                console.log(err);
            }
        } 
    }

    //事件绑定操作
    var ev = {
        addEventHandler:function(target, type, func) {//添加事件
            if (target.addEventListener)
                target.addEventListener(type, func, false);
            else if (target.attachEvent)
                target.attachEvent("on" + type, func);
            else target["on" + type] = func;
        },
        removeEventHandler:function(target, type, func) {//移除事件
            if (target.removeEventListener)
                target.removeEventListener(type, func, false);
            else if (target.detachEvent)
                target.detachEvent("on" + type, func);
            else delete target["on" + type];
        },
        getElsByTagName:function(tagName,inputType){//获取需要监听的节点
            if(inputType){
                var inputs = document.getElementsByTagName(tagName),
                    tmpInputs = [];
                for(var i=0; i<inputs.length; i++){
                    if(inputs[i].type==inputType){
                        tmpInputs.push(inputs[i]);
                    }
                }
                return tmpInputs;
            }else{
                return document.getElementsByTagName(tagName);
            }
        },
        getElsByTagName:function(tagName,inputType){//获取需要监听的节点
            if(inputType){
                var inputs = document.getElementsByTagName(tagName),
                    tmpInputs = [];
                for(var i=0; i<inputs.length; i++){
                    if(inputs[i].type==inputType){
                        tmpInputs.push(inputs[i]);
                    }
                }
                return tmpInputs;
            }else{
                return document.getElementsByTagName(tagName);
            }
        },
        addEvents:function(tag,inputType,events){//定义不同事件类型
            if(typeof(tag)=='string'){
                var els = ev.getElsByTagName(tag,inputType);
                for(var i=0; i<els.length; i++){
                    for(var j=0; j<events.length; j++){
                        ev.addEventHandler(els[i],events[j],ev.eventFun);
                    }
                }
            }else if(typeof(tag)=='object'){//window 
                for(var j=0; j<events.length; j++){
                    ev.addEventHandler(tag,events[j],inputData.sendData);
                }
            }
        },
        eventFun:function(e){//单次行为记录
            var el = e.target;
            if(e.type=='focus'){
                dataItem.id = el.id;
                dataItem.name = el.name;
                dataItem.type = e.target.nodeName;
                dataItem.start = new Date().getTime();
                dataItem.beforeValue = el.value;
                var applyNoInput = document.getElementById('applyNo');
                if(applyNoInput){
                    dataItem.applyNo = applyNoInput.name;
                }
            }else if(e.type=='blur'){
                //if(dataItem.start&&!dataItem.end){//避免blur、change事件重复监听
                    dataItem.end = new Date().getTime();
                    dataItem.afterValue = el.value;
                    dataItem.event = e.type;
                    locStorage.insert(inputData.keyName,dataItem);
                    dataItem = inputData.getTmpData();//清空
                //}
            }else if(e.type=='change'){//获取焦点时，连续操作  无法获取beforeValue、start
                //if(dataItem.start&&!dataItem.end){
                    //console.log(el);
                    dataItem.id = el.id;
                    dataItem.name = el.name;
                    dataItem.type = e.target.nodeName;
                
                    dataItem.end = new Date().getTime();
                    dataItem.afterValue = el.value;
                    dataItem.event = e.type;
                    locStorage.insert(inputData.keyName,dataItem);
                    dataItem = inputData.getTmpData();//清空
                //}
            }
        }
    }
    //输入框行为数据
    var inputData = {
        keyName:'bData',
        sending:false,
        getTmpData :function(){
            return {
                id : '',//
                name : '',
                type:'',
                html:location.href,
                start:'',
                end:'',
                beforeValue:'',
                afterValue:'',
                event:'',
                applyNo:'',
            };
        },
        bindEvent:function(){
            //1、定时发送
            /*setInterval(function(){
                console.log('dingshi');
                inputData.sendData();
            },confData.asyncConf.reportTime*1000);*/

            //2、页面'load','pagehide','beforeunload'时发送
            //ev.addEvents(window,'',['load','pagehide']);
            inputData.sendData();

            ev.addEvents('input','text',['focus','blur']);//监听input[type="text"]的 focus、blur事件
            ev.addEvents('input','password',['focus','blur']);//监听input[type="text"]的 focus、blur事件
            ev.addEvents('textarea','',['focus','blur']);//监听input[type="text"]的 focus、blur事件
            //ev.addEvents('select','',['focus','change']);//监听select的 focus、change事件
        },
        //获取需要发送的数据
        getSendData:function(){
            var bData = locStorage.get(inputData.keyName),
                tmpData = null;
            if(bData){
                if(bData.dataBak&&bData.dataBak.length>0){//先发送备份数据
                    tmpData = bData.dataBak;
                }else{
                    if(bData.data.length>0){
                        bData.dataBak = bData.data;
                        bData.data = [];
                        locStorage.set(inputData.keyName,bData);
                        
                        tmpData = bData.dataBak;
                    }
                }
            }
            return tmpData;
        },
        sendData:function(){
            var tmpData = inputData.getSendData();
            try{
                if(tmpData&&!inputData.sending){
                    var xhr = getXMLHttpRequest(), 
                        userId = Cookie.get('user_id'),
                        params ="user_id="+userId+"&source=3&contentJson="+JSON.stringify({'data':tmpData,'chennel':confData.channelCode,'user_id':userId,'deviceInfo':confData.appVersionId});
                    if(xhr){
                        xhr.open("post",inputDataPath);  
                        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
                        xhr.send(params); 
                        inputData.sending = true; 
                        xhr.onreadystatechange= function() {  
                            if(xhr.readyState == 4 && xhr.status == 200) {  
                                var data = JSON.parse(xhr.response);
                                inputData.sending = false; 
                                if(data.ask==0){
                                    var bData = locStorage.get(inputData.keyName);
                                    bData.dataBak = null;
                                    locStorage.set(inputData.keyName,bData);
                                    // console.log(locStorage.get(inputData.keyName));
                                }
                            }  
                        }; 
                    } 
                }
            }catch(err){
                console.log(err);
            }
        }
    }
    var dataItem = inputData.getTmpData();

    //请求数据
    var reqData = {
        open:window.XMLHttpRequest.prototype.open,
        send:window.XMLHttpRequest.prototype.send,
        onReadyStateChange:'',
        sendDataObj:{},
        keyName:'reqData',
        sending:false,
        openReplacement:function(method, url, async, user, password) {
            var syncMode = async !== false ? 'async' : 'sync';
            reqData.sendDataObj.method = method;
            reqData.sendDataObj.url = encodeURIComponent(url);
            //this.setRequestHeader('token','123');
            return reqData.open.apply(this, arguments);//继承open对象中的属性和方法
        },
        sendReplacement:function(data) {
            if(this.onreadystatechange) {
                this._onreadystatechange = this.onreadystatechange;
            }
            this.onreadystatechange = reqData.onReadyStateChangeReplacement;
            reqData.sendDataObj.data = data;

            var flag = true;//屏蔽链接
            for(var i=0;i<confData.excludeConf.domains.length;i++){
                if(reqData.sendDataObj.url.indexOf(encodeURIComponent(confData.excludeConf.domains[i])>=0)){
                    flag = false;
                }
            }
            if(flag){//缓存数据
                if(reqData.sendDataObj.url.indexOf(encodeURIComponent(requestDataPath))<0&&reqData.sendDataObj.url.indexOf(encodeURIComponent(inputDataPath))<0){
                    try{
                        if(isInArr(reqData.sendDataObj.url)){
                            locStorage.insert(reqData.sendDataObj.url,reqData.sendDataObj);
                        }else{
                            locStorage.insert(reqData.keyName,reqData.sendDataObj);
                        }
                        
                    }catch(err){
                       console.log(err);
                    }
                }
            } 
            return reqData.send.apply(this, arguments);
        },
        onReadyStateChangeReplacement:function(){
            if(this._onreadystatechange&&this.readyState==4) {
                /*//console.log(this.getAllResponseHeaders());
                if(this.getResponseHeader("Content-Type")&&this.getResponseHeader("Content-Type").indexOf('application/json')>=0){
                    if(this.responseText){
                        var obj = eval('('+this.responseText+')');
                    }
                }*/
                return this._onreadystatechange.apply(this, arguments);
            }
        },
        isInArr:function(url){
            var flag = false,arr = confData.syncConf.requestDataConf;
            for(var i=0;i<arr.length;i++){
                if(url.indexOf(encodeURIComponent(arr[i].url))>=0){
                    flag = true;
                }
            }
            return flag;
        },
        bindEvent:function(){
            //1、定时发送
            /*setInterval(function(){
                console.log('dingshi');
                reqData.sendData();
            },confData.asyncConf.reportTime*1000);*/

            //2、页面'load','pagehide','beforeunload'时发送
            //ev.addEvents(window,'',['load','pagehide']);
            reqData.sendData();
        },
        //获取需要发送的数据
        getSendData:function(){
            var bData = locStorage.get(reqData.keyName),
                tmpData = null;
            if(bData){
                if(bData.dataBak&&bData.dataBak.length>0){//先发送备份数据
                    tmpData = bData.dataBak;
                }else{
                    if(bData.data.length>0){
                        bData.dataBak = bData.data;
                        bData.data = [];
                        locStorage.set(reqData.keyName,bData);
                        
                        tmpData = bData.dataBak;
                    }
                }
            }
            return tmpData;
        },
        sendData:function(key){
            try{
                var tmpData = key==reqData.keyName?getSendData():locStorage.get(key);
                if(tmpData&&!reqData.sending){
                    var xhr = getXMLHttpRequest(), 
                        userId = Cookie.get('user_id'),
                        params ='userId='+userId+'&h5Json='+JSON.stringify(tmpData)+'&chennel='+confData.channelCode+'&createDate='+new Date();
                    var time = reqData.delayTime(5);
                    //console.log(time);
                    if(xhr){
                        setTimeout(function(){//避免同时提交请求
                            //console.log(locStorage.get(key));
                            locStorage.remove(key);
                            //console.log(locStorage.get(key));
                            xhr.open("post",requestDataPath);  
                            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
                            xhr.send(params); 
                            reqData.sending = true; 
                            xhr.onreadystatechange= function() {  
                                if(xhr.readyState == 4 && xhr.status == 200) {  
                                    var data = JSON.parse(xhr.response);
                                    reqData.sending = false; 
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
        },
        delayTime:function(num){
            return Math.round(Math.random()*num+1)*1000;
        }
    }
    
    //Cookie 操作
    //Cookie.set('kk','45');
    //console.log(Cookie.get());
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
    
    //localStorage操作
    var locStorage = {
        insert:function(key,data){
            if(key==inputData.keyName){
                var bData = locStorage.get(key);
                bData = bData?bData:{
                    data:[]
                };
                bData.data.push(data);
                locStorage.set(key,bData);
                
                if(bData.data.length>=confData.asyncConf.reportVolume){//定量发送
                    // console.log('dingliang');
                    inputData.sendData();
                }
            }else{
                var bData = locStorage.get(key);
                bData = bData?bData:{
                    reqInfo:[]
                };
                bData.reqInfo.push(data);
                locStorage.set(key,bData);
                console.log(locStorage.get(key));
                if(key!=reqData.keyName){
                    reqData.sendData(key);
                }else{
                    if(bData.data.length>=confData.asyncConf.reportVolume){//定量发送
                        // console.log('dingliang');
                        reqData.sendData();
                    }
                }
            }
        },
        set:function(key,data){
            try{
                if(localStorage){
                   localStorage.setItem(key,JSON.stringify(data));
                }
            }catch(err){
                console.log(err);
            }
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

    getConfData(function(data){
        confData = data;
        if(confData){
            //输入框行为数据
            inputData.bindEvent();
            //请求数据
            window.XMLHttpRequest.prototype.open = reqData.openReplacement;
            window.XMLHttpRequest.prototype.send = reqData.sendReplacement;
            
            locStorage.insert(encodeURIComponent(location.href),{"method":"get","url":encodeURIComponent(location.href),"data":""});
        }
    });
})();