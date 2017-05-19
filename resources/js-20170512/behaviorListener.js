function behaviorListener(){
    var keyName = 'bData',
        dataItem = initDataItem(),//记录 单次行为数据开始、结束状态
        time = 1000,//定时发送
        maxNum = 10,//定量发送
        serverPath = 'http://bdc.bqjr.cn/behavior/inputMonitoring',//提交地址
        //serverPath = 'http://10.80.2.46:8888/bqjr-behavior/behavior/inputMonitoring',//提交地址
        sending = false;
    var deviceInfo;//设备信息
    var chennelStr='FCM';//渠道

    function initDataItem(){
        return {
            id : '',//
            name : '',
            type:'',
            html:'',
            start:'',
            end:'',
            beforeValue:'',
            afterValue:'',
            event:'',
            applyNo:'',
        };
    }      
    function addEventHandler(target, type, func) {//添加事件
        if (target.addEventListener)
            target.addEventListener(type, func, false);
        else if (target.attachEvent)
            target.attachEvent("on" + type, func);
        else target["on" + type] = func;
    }
    function removeEventHandler(target, type, func) {//移除事件
        if (target.removeEventListener)
            target.removeEventListener(type, func, false);
        else if (target.detachEvent)
            target.detachEvent("on" + type, func);
        else delete target["on" + type];
    }
    var getElsByTagName = function(tagName,inputType){//获取需要监听的节点
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
    }
    var addEvents = function(tag,inputType,events){//定义不同事件类型
        if(typeof(tag)=='string'){
            var els = getElsByTagName(tag,inputType);
            for(var i=0; i<els.length; i++){
                for(var j=0; j<events.length; j++){
                    addEventHandler(els[i],events[j],eventFun);
                }
            }
        }else if(typeof(tag)=='object'){//window 
            for(var j=0; j<events.length; j++){
                addEventHandler(tag,events[j],sendData);
            }
        }
    }
    var eventFun = function(e){//单次行为记录
        var el = e.target,
            pagePath = location.href;
        if(e.type=='focus'){
            dataItem.id = el.id;
            dataItem.name = el.name;
            dataItem.type = e.target.nodeName;
            dataItem.html = pagePath;
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
                insertLocalStorage(keyName,dataItem);
                dataItem = initDataItem();//清空
            //}
        }else if(e.type=='change'){//获取焦点时，连续操作  无法获取beforeValue、start
            //if(dataItem.start&&!dataItem.end){
                //console.log(el);
                dataItem.id = el.id;
                dataItem.name = el.name;
                dataItem.type = e.target.nodeName;
                dataItem.html = pagePath;
            
                dataItem.end = new Date().getTime();
                dataItem.afterValue = el.value;
                dataItem.event = e.type;
                insertLocalStorage(keyName,dataItem);
                dataItem = initDataItem();//清空
            //}
        }
    }
    //单次数据插入localStorage
    var insertLocalStorage= function(key,data){
        var bData = getLocalStorage(key);
        bData = bData?bData:{
            data:[]
        };
        bData.data.push(data);
        localStorage.setItem(key,JSON.stringify(bData));
        
        if(bData.data.length>=maxNum){//定量发送
            // console.log('dingliang');
            sendData();
        }
    }
    //更新localStorage
    var updateLocalStorage= function(key,data){
        localStorage.setItem(key,JSON.stringify(data));
    }
    //获取localStorage
    var getLocalStorage= function(key){
        return JSON.parse(localStorage.getItem(key));
    }
    //删除localStorage
    var removeLocalStorage = function(key){
        localStorage.removeItem(key);
    }
    //保存修改前的值
    
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
    // Cookie.set('kk','45');
    // console.log(Cookie.get());
    
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
    function getDeviceInfo(){
        var userId;
        try{
            if(isAndroid()){
                deviceInfo = android.getDeviceId();
            }else if(isIOS()){
                deviceInfo = mobile.getDeviceInfo();
            }
        }catch(err){
            console.log(err);
        }
        return userId;
    }
    getDeviceInfo();

    //获取需要发送的数据
    var getSendData = function(){
        var bData = getLocalStorage(keyName),
            tmpData = null;
        if(bData){
            if(bData.dataBak&&bData.dataBak.length>0){//先发送备份数据
                tmpData = bData.dataBak;
            }else{
                if(bData.data.length>0){
                    bData.dataBak = bData.data;
                    bData.data = [];
                    updateLocalStorage(keyName,bData);
                    
                    tmpData = bData.dataBak;
                }
            }
        }
        return tmpData;
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
    var sendData = function(){
        var tmpData = getSendData();

        if(tmpData&&!sending){
            var xhr = getXMLHttpRequest(), 
                userId = Cookie.get('user_id'),
                params ="user_id="+userId+"&source=3&contentJson="+JSON.stringify({'data':tmpData,'chennel':chennelStr,'user_id':userId,'deviceInfo':deviceInfo});
            if(xhr){
                xhr.open("post",serverPath);  
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); 
                xhr.send(params); 
                sending = true; 
                xhr.onreadystatechange= function() {  
                    if(xhr.readyState == 4 && xhr.status == 200) {  
                        var data = JSON.parse(xhr.response);
                        sending = false; 
                        if(data.ask==0){
                            var bData = getLocalStorage(keyName);
                            bData.dataBak = null;
                            updateLocalStorage(keyName,bData);
                            // console.log(getLocalStorage(keyName));
                        }
                    }  
                }; 
            } 
        }
    }
    //1、定时发送
    setInterval(function(){
        // console.log('dingshi');
        sendData();
    },time);

    //2、页面'load','pagehide','beforeunload'时发送
    addEvents(window,'',['load']);
     
    addEvents('input','text',['focus','blur']);//监听input[type="text"]的 focus、blur事件
    addEvents('input','password',['focus','blur']);//监听input[type="text"]的 focus、blur事件
    addEvents('textarea','',['focus','blur']);//监听input[type="text"]的 focus、blur事件
    //addEvents('select','',['focus','change']);//监听select的 focus、change事件
}

behaviorListener();

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
var xhr = getXMLHttpRequest(); 
if(xhr){
    //xhr.open("get",'resources/js/test.js');  
    xhr.open("get",'resources/js/test.json');  
    xhr.send(); 
    sending = true; 
    xhr.onreadystatechange= function() {  
        if(xhr.readyState == 4 && xhr.status == 200){  
            var data = JSON.parse(xhr.response);
            console.log(data);
        }
    }; 
} 