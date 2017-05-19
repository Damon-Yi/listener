/*common layer template*/
var myLayer = function(params){
    var me = {};
    me.params = params?params:{
        'layerCont':'',
        'hasShadowBg':false,
        'shadowClose':false,
        'funcs':{}
    };
    me.init = function(){
        me.layerCont = $(me.params.layerCont).clone();
        me.layerContainer = $('<div class="layer_container"></div>');
        me.layerContWrap = $('<div class="layer_cont_wrap"></div>');
        me.layerBg = $('<div class="bg"></div>');

        me.layerContainer.append(me.layerContWrap.append(me.layerCont.addClass('layer_cont')));

        if(me.params.hasShadowBg){
            me.layerContainer.prepend(me.layerBg);
        }
        if(me.params.shadowClose){
            me.layerBg.on('touchend',function(e){
                e.preventDefault();
                me.destory();
            });
        }
        /*handle func*/
        if(me.params.funcs){
            for(var o in me.params.funcs){
                me.layerContainer.find(o).on('touchend',{'func':me.params.funcs[o]},function(e){
                    e.preventDefault();
                    e.data.func();
                });
            }
        }
        $('body').append(me.layerContainer);
    }
    me.destory = function(){
        me.layerContainer.remove();
        me.layerCont.removeClass('layer_cont');
    }
    me.show = function(){
        if(me.params.layerCont){
            me.init();
        }
    }
    return me;
}

/*确认弹框*/
var confirmDialog = function(params){
    var me = {};
    me.params = params?params:{
        type:1,
        hasShadowBg:true,
        title:'test',
        titleClass:'',
        txt:'test info',
        txtClass:'',
        btns:[{
                text:'',
                callBack:function(){}
            }
        ]
    }
    me.init = function(){
        me.layerContainer = $('<div class="layer_container"></div>');
        me.layerContWrap = $('<div class="layer_cont_wrap"></div>');
        me.layerBg = $('<div class="bg"></div>');

        me.dialog = $('<div class="conform_dialog layer_cont"></div>');
        if(me.params.type==1){
            me.dialog.addClass('type_1');
        }else if(me.params.type==2){
            me.dialog.addClass('type_2');
        }

        me.title = $('<p class="c_title"></p>');
        me.txt = $('<p class="c_txt"></p>');
        me.btnsWrap = $('<div class="c_btns"></div>');

        
        if(me.params.title){
            me.dialog.append(me.title.text(me.params.title));
        }
        if(me.params.titleClass){
            me.dialog.append(me.title.addClass(me.params.titleClass));
        }
        if(me.params.txt){
            me.dialog.append(me.txt.text(me.params.txt));
        }
        if(me.params.txtClass){
            me.dialog.append(me.txt.addClass(me.params.txtClass));
        }
        for(var i=0;i<me.params.btns.length;i++){
            var btn = $('<a href="javascript:;">'+me.params.btns[i].text+'</a>');
            var callBack = me.params.btns[i].callBack;
            btn.on('touchend',{callBack:callBack},function(e){
                e.preventDefault();
                e.data.callBack();
            });
            me.btnsWrap.append(btn);
        }
        me.dialog.append(me.btnsWrap);

        if(me.params.hasShadowBg){
            me.layerContainer.prepend(me.layerBg);
        }
        me.layerContainer.append(me.layerContWrap.append(me.dialog));
        $('body').append(me.layerContainer);
    }
    me.show = function(){
        me.init();
    }
    me.destory = function(){
        me.layerContainer.remove();
    }

    return me;
}

/*提示，弹窗*/
//tips('数据错误','tips_center',1500);
//tips('数据错误','tips_left',1500);
function tips(msg,className,time){
    $('.tips').remove();
    var tipsDiv = $('<div class="tips '+className+'"></div>');
    $('body').append(tipsDiv);
    tipsDiv.html(msg).addClass('tips_show');
    setTimeout(function(){
        tipsDiv.removeClass('tips_show').remove();
    },time);
}
/*获取验证码 1,div*/
function getCodefun(obj,phone,time){
    var me = {};
    me.obj = obj;
    me.phone = phone;
    me.wait= time;
    me.time = function(obj) { 
        if (me.wait == 0) { 
            obj.text("获取验证码"); 
            me.wait = time; 
        }else { 
            obj.text(me.wait + "s"); 
            me.wait--;
            setTimeout(function(){ 
                me.time(obj);
            },1000);
        } 
    } 
    me.getCodeBindEvent = function(){
        obj.on('tap',function(e){
            var p = me.phone;
            var num = (typeof(p) == 'object')?p.val():p;
            if(Number(num)&&(num+'').length==11){
                me.time(obj);
                $(this).off('tap');
            }else{
                console.log('号码为空或格式不对');
                p.focus();
            }
        });
        setTimeout(function(){ 
            me.getCodeBindEvent(obj);
        },me.wait*1000);
    }
    me.getCodeBindEvent(me.obj,me.phone);
    return me;
}
/*获取验证码 2,button*/
var getCode = function(btn,time,fn,specialTimeObj){
    var me = {};
    me.btn = btn;
    me.wait= time;
    me.callBack = fn;
    me.specialTimeObj = specialTimeObj;
    me.show = function() {
        $(me.btn).attr("disabled","disabled");//设置button不可用

        if(me.specialTimeObj&&me.wait==me.specialTimeObj.specialTime){
            me.specialTimeObj.fn();
        }
        
        me.wait--;
        $(me.btn).val(me.wait+"秒").css('color','#999');
        if(me.wait == -1){
            $(me.btn).removeAttr("disabled");//设置button不可用
            $(me.btn).val("获取").css('color','#0aaefd');
            return ;
        }else if(me.wait == 0){
            $(me.btn).removeAttr("disabled");//设置button不可用
            $(me.btn).val("重新获取").css('color','#0aaefd');
            me.wait = time;
            return ;
        }else if(me.wait>0){
            setTimeout(function(){
                me.show();
            }, 1000);
        }
    };
    me.init = function(){
        if($(me.btn).attr("disabled")!="disabled"){//fix button disabled='disabled' 失效
            me.callBack();
            me.show();
        }
    };
    me.reset = function(){
        me.wait = 0;
    };
    me.init();
    return me;
}
/*倒计时,分为单位*/
var countDown = function(wrapObj,time,fn,specialTimeObj){
    var me = {};
    me.wrapObj = wrapObj;
    me.wait= time;
    me.callBack = fn;
    me.specialTimeObj = specialTimeObj;
    me.show = function() {
        if(me.specialTimeObj&&me.wait<=me.specialTimeObj.specialTime){
            me.specialTimeObj.fn(me);
        }
        me.wait--;
        me.wrapObj.text(me.wait+"分");
        if(me.wait == 0){
            me.wrapObj.text("已超时").css('color','#999');
            me.callBack();
            return ;
        }else if(me.wait>0){
            setTimeout(function(){
                me.show();
            }, 60*1000);
        }
    };
    me.init = function(){
        me.show();
    };
    me.init();
    return me;
}

/*数字键盘*/
function enterPsw($wrapper,parms){
    var me = {};
    var parms = parms?parms:{
        title:'支付',
        amount:'0',
        faliedUrl:'',
        pay:function(){
            return;
        }
    }
    
    var $bg = $('<div class="bg-layer"></div>');
    
    var $panel = $('<div class="alert"><div class="a-header"><span class="a-close"></span><span>请输入支付密码</span><span class="a-pw">忘记密码</span></div><div class="a-body"><p class="a-type">'+parms.title+'</p><p class="a-num">￥'+parms.amount+'</p><div class="a-pw-wrap"><span contenteditable="false"><i></i></span><span contenteditable="false"><i></i></span><span contenteditable="false"><i></i></span><span contenteditable="false"><i></i></span><span contenteditable="false"><i></i></span><span contenteditable="false"><i></i></span></div><input type="text" class="psw"></div></div>');
     
    var $keyboard = $('<div class="num-keyboard"><table><tr><td class="num-td">1</td><td class="num-td">2</td><td class="num-td">3</td></tr><tr><td class="num-td">4</td><td class="num-td">5</td><td class="num-td">6</td></tr><tr><td class="num-td">7</td><td class="num-td">8</td><td class="num-td">9</td></tr><tr><td class="grey-bg"></td><td class="num-td">0</td><td class="grey-bg del-td"><img src="../images/del-btn.png" alt=""></td></tr></table></div>');
    //支付失败
    var $payFailed = $('<div class="alert pay-fail-popup"><div class="a-info">支付失败</div><div class="a-btn"><div class="cancel">重试</div><div class="change-card">取消</div></div></div>');

    $wrapper.append($bg).append($panel).append($keyboard).append($payFailed);
    //数字按钮
    $keyboard.find('.num-td').on('tap',function(){
        $(this).addClass('active');
        var _that = this;
        setTimeout(function(){
            $(_that).removeClass('active');
        },100);
        var currNum = $(this).text();
        var psw = $panel.find('.psw').val();
        
        if(psw.length<6){
            $panel.find('.a-pw-wrap>span').eq(psw.length).addClass('active');
            $panel.find('.psw').val(psw+currNum);
        }
        if($panel.find('.psw').val().length==6){
            parms.pay();
            $panel.find('.a-pw-wrap>span').removeClass('active');
            $panel.find('.psw').val('');
        }
    });
    //删除按钮
    $keyboard.find('.del-td').on('tap',function(){
        $(this).addClass('active');
        var _that = this;
        setTimeout(function(){
            $(_that).removeClass('active');
        },100);
        var psw = $panel.find('.psw').val();
        if(psw.length>0){
            $panel.find('.a-pw-wrap>span').eq(psw.length-1).removeClass('active');
            $panel.find('.psw').val(psw.substring(0,psw.length-1));
        }
    });
    //关闭按钮
    $panel.find(".a-close").on("tap",function(e){
        me.close();
    });
    //重试
    $payFailed.find('.cancel').on("tap",function(e){
        me.payFailedclose();
        me.show();
    });
    //取消
    $payFailed.find('.change-card').on("tap",function(e){
        me.payFailedclose();
        //跳转到首页
        window.location = parms.faliedUrl;
    });
    me.close = function(){
        $panel.removeClass('alert-show');
        $keyboard.removeClass('num-keyboard-show');
        //setTimeout(function(){
            $bg.css("display","none");
        //},200);
    }
    me.show = function(){
        $bg.css('display','block');
        $panel.addClass('alert-show');
        $keyboard.addClass('num-keyboard-show');
    }
    me.payFailedshow = function(msg){
        if(msg){
            $payFailed.find('.a-info').text(msg);
        }
        $bg.css('display','block');
        $payFailed.addClass('alert-show');
    }
    me.payFailedclose = function(){
        $bg.css('display','none');
        $payFailed.removeClass('alert-show');
    }
    return me;
}

/*confirm,弹窗*/
function confirmWin($wrapper,parms){
    var me = {};
    var parms = parms?parms:{
        title:'支付',
        leftBtnText:'cancel',
        rightBtnText:'confirm',
        cancel:function(){
            return;
        },
        confirm:function(){
            return;
        }
    }
    var $bg = $('<div class="bg-layer"></div>');
    var $confirmPanel = $('<div class="alert confirm-popup"><div class="a-info"></div><div class="a-btn"><div class="a-btn-left"></div><div class="a-btn-right"></div></div></div>');
    $wrapper.append($bg).append($confirmPanel);
    //left btn
    $confirmPanel.find('.a-btn-left').on("tap",function(e){
        parms.cancel();
    });
    //right btn
    $confirmPanel.find('.a-btn-right').on("tap",function(e){
        parms.confirm();
    });
    me.close = function(){
        $confirmPanel.removeClass('alert-show');
        //setTimeout(function(){
            $bg.css("display","none");
        //},200);
    }
    me.show = function(){
        $bg.css('display','block');
        $confirmPanel.addClass('alert-show');
    }
    me.init = function(){
        $confirmPanel.find('.a-info').text(parms.title);
        $confirmPanel.find('.a-btn-left').text(parms.leftBtnText);
        $confirmPanel.find('.a-btn-right').text(parms.rightBtnText);
    }
    me.init();
    return me;
}

/*图片转Base64*/
function getBase64Image(src) {
    var img = document.createElement('img');
    img.src = src;
    console.log(img);
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    console.log(dataURL);
    //return dataURL
    return dataURL.replace("data:image/png;base64,", "");
} 

/*loading*/
//var loader = new loading({'container':document.body,'hasBg':false});
var loading = function(param){
    me = {}
    me.param = param?param:{
        'container':document.body,
        'hasBg':true
    };

    me.init = function(){
        me.loader=document.createElement("div"),
        loader_bg=document.createElement("div"),
        span_wrap=document.createElement("div");

        me.loader.className="loader";
        loader_bg.className="loader_bg";
        span_wrap.className="span_wrap";
        for(var i=0;i<5;i++){
            var span=document.createElement("span");
            span_wrap.appendChild(span);   
        }
        if(me.param.hasBg){
           me.loader.appendChild(loader_bg);
           span_wrap.style.background ='rgba(0,0,0,0)'; 
        }
        me.loader.appendChild(span_wrap); 
        me.param.container.appendChild(me.loader);
    }
    me.show = function(){
        me.loader.style.display = 'block';
    }
    me.hide = function(){
        me.loader.style.display = 'none';
    }
    me.destroy = function(){
        document.body.removeChild(me.loader);
    }
    me.init();
    return me;
}
/*url截取值*/
function getQueryStringArge(){              
    var qs=location.search.length>0?location.search.substring(1):'',//首先是判断url的？后面又没有数据             
        items=qs.length?qs.split("&"):[],//如果有数据  则把字符串变成数组形式               
        args={},
        item=null,
        name=null,
        value=null;
    for(var i=0;i<items.length;i++){
        item=items[i].split("=");
        name=decodeURIComponent(item[0]);
        value=decodeURIComponent(item[1]);
        if(name){
            args[name]=value;   
        }   
    }
    return args
    
}
//状态生成器
function comState(status){
    switch(status){
        case '10':
            return "待派单";
            break;
        case '20':
            return  "待接单";
            break;
        case '30':
            return "待预约";
            break;
        case '40':
            return  "待提单";
            break;
        case '50':
            return  "已完成";
            break;
        case '60':
            return  "已取消";
            break;
    }
}
//时间戳转换
function formatDate(now) { 
    if(parseInt(now)){
        var nowDate=new Date(parseInt(now));
        var year=nowDate.getFullYear(); 
        var month=nowDate.getMonth()+1; 
        var date=nowDate.getDate(); 
        var hour=nowDate.getHours(); 
        var minute=nowDate.getMinutes()< 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes(); 
        var second=nowDate.getSeconds()< 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds(); 
        
        return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
    }else{
        return '';
    }
     
} 
/*转换年月日*/
function formatDate2(now) { 
    var nowDate=new Date(now);
    var year=nowDate.getFullYear(); 
    var month=nowDate.getMonth()+1; 
    var date=nowDate.getDate(); 
    if(month<10){
        month="0"+month;
    }
    return dates=year+"-"+month+"-"+date; 
} 
//获取当前用户身份
function getCurrUserIdentity(){
    var userInfo = getUserInfo();
    var currUserIdentity;
    //买买提
    var SA = {
    	headerMenu:[["0",'全部'],["20",'待接单'],["30",'待预约'], ["40",'待提单'], ["50",'已完成']],
		status:{
            "0":{
                text:"全部",
                btns:[] 
            },
            "20":{
                text:"待接单",
                btns:['cancel','recive'],//20  待接单   取消、接单
            },
            "30":{
                text:"待预约",
                btns:['cancel','turn','subscr'],  //30 待预约  取消、转单、预约
            },
            "40":{
                text:"待提单",
                btns:['cancel','improve','ladoder'],  //40 待提单 取消、改约、提单
                subStatus:{
                	'0':{
	                	text:'待提单',
	                	btns:['cancel','improve','ladoder'],  //40 待提单 取消、改约、提单
	                },
	                '19':{
	                	text:'待提单',
	                	btns:['cancel','improve','ladoder'],  //40 待提单 取消、改约、提单
	                },
	                '100':{
	                	text:'待重传',
	                	btns:['cause','cancel','improve','ladoder'],//40 待提单   查看原因  取消、改约、提单
	                },
                	'150':{
	                	text:'待重传',
	                	btns:['cause','cancel','improve','ladoder'],//40 待提单   查看原因  取消、改约、提单
	                },
                }
            },
            "50":{
                text:"已完成 ",
                btns:[],//50 已完成  
                subStatus:{
                	'0':{
	                	text:'待初审',
	                	btns:['examine']//50 已完成   提单详情 
	                },
	                '160':{
	                	text:'初审中',
	                	btns:['examine']//50 已完成   提单详情 
	                },
	                '170':{
	                	text:'待审核',
	                	btns:['examine']//50 已完成   提单详情
	                },
	                '300':{
	                	text:'审核通过',
	                	btns:['download','uploading','examine']//50 已完成       查看合同   上传资料      提单详情 
	                },
	                '400':{
	                	text:'审核不通过',
	                	btns:[]//50 已完成   
	                },
	                '500':{
	                	text:'待复核',
	                	btns:['download','lookdata','examine']//50 已完成    查看合同   查看资料   提单详情
	                },
	                '650':{
	                	text:'待重传',
	                	btns:['cause','download','uploading','examine']//50 已完成   查看原因   查看合同  修订资料      提单详情 
	                },
	                '700':{
	                	text:'复核完成',
	                	btns:['evaluate','examine']//50 已完成  风险评价    提单详情 
	                },
                }
            },
        }
        
    },CM = {
//  	headerMenu:[["0",'全部'],["20",'待接单'],["30",'待转单'], ["60",'已取消']],
		headerMenu:[["0",'全部'],["20",'待接单'],["30",'待预约'], ["40",'待提单'], ["50",'已完成']],
    	status:{
            "0":{
                text:"全部",
                btns:[] 
            },
            "20":{
                text:"待接单",
                btns:['cancel','recive','turn'],//20  待接单   取消、接单、转单
            },
            "30":{
                text:"待预约",
                btns:['cancel','turn','subscr'],  //30 待预约  取消、转单、预约
            },
            "40":{
                text:"待提单",
                btns:['cancel','improve','ladoder'],  //40 待提单 取消、改约、提单
                subStatus:{
                	'0':{
	                	text:'待提单',
	                	btns:['cancel','improve','ladoder'],  //40 待提单 取消、改约、提单
	                },
	                '19':{
	                	text:'待提单',
	                	btns:['cancel','improve','ladoder'],  //40 待提单 取消、改约、提单
	                },
	                '100':{
	                	text:'待重传',
	                	btns:['cause','cancel','improve','ladoder'],//40 待提单   查看原因  取消、改约、提单
	                },
                	'150':{
	                	text:'待重传',
	                	btns:['cause','cancel','improve','ladoder'],//40 待提单   查看原因   、取消订单、改约、提单
	                },
                }
            },
            "50":{
                text:"已完成",
                btns:[],//50 已完成  
                subStatus:{
                	'0':{
	                	text:'待初审',
	                	btns:['examine']//50 已完成   提单详情 
	                },
	                '160':{
	                	text:'初审中',
	                	btns:['examine']//50 已完成   提单详情 
	                },
	                '170':{
	                	text:'待审核',
	                	btns:['examine']//50 已完成   提单详情
	                },
	                '300':{
	                	text:'审核通过',
	                	btns:['download','uploading','examine']//50 已完成    查看合同      上传资料   提单详情 
	                },
	                '400':{
	                	text:'审核不通过',
	                	btns:[]//50 已完成   
	                },
	                '500':{
	                	text:'待复核',
	                	btns:['download','lookdata','examine']//50 已完成    查看合同   查看资料   提单详情
	                },
	                '650':{
	                	text:'待重传',
	                	btns:['cause','download','uploading','examine']//50 已完成   查看原因    查看合同  修订资料      提单详情 
	                },
	                '700':{
	                	text:'复核完成',
	                	btns:['evaluate','examine']//50 已完成    风险评价   提单详情 
	                },
                }
            },
            "60":{
                text:"已取消",
                btns:[],  //60 已取消  
            },
            "70":{
                text:"待取消",
                btns:['reason','confirm','turn'],  //70 待取消  查看原因、确定取消、转单
            },
		}
    };
    
    if(userInfo && userInfo.positionId=="1"){//面签员身份id
        currUserIdentity = SA;
    }else if(userInfo && userInfo.positionId=="10"||userInfo.positionId=="20" ||userInfo.positionId=="30"){//城市经理身份id
        currUserIdentity = CM;
    }
    return currUserIdentity;
}
//function isNotEmpty(value){
//  if(value==undefined){
//      return false
//  }
//  return !/^\s*$/.test(value)
//}
//$.fn['getFormValue']=function(){
//  var returnVal={};
//  $(this).find("input,select").each(function(){
//  var name=$(this).attr("name");
//  var value=$(this).val();
//  if(isNotEmpty(name)&&isNotEmpty(value)){
//      if($(this).is("input[type='radio']")&&
//          !$(this).is("input:checked")){
//      }else{
//          returnVal[name]=value;
//      }
//      }
//  });
//  return returnVal;
//};
var urls=window.location.href;
/*返回方法*/
function goBack(){
	var Popup=$(".layer_container");
	if(Popup){
		console.log(1);
	}else{
		if(urls.indexOf("orders.html")>=0){
	        console.log("列表")
	    }else if(urls.indexOf("search.html")>=0){
	    	console.log("搜索")
	    }else{
	    	window.history.go(-1);
	    }
	} 
}
/*阻止用户双击使屏幕上滑*/
var agent = navigator.userAgent.toLowerCase();        //检测是否是ios
var iLastTouch = null;                                //缓存上一次tap的时间
if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0)
{
    document.body.addEventListener('touchend', function(event)
    {
        var iNow = new Date()
            .getTime();
        iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */ ;
        var delta = iNow - iLastTouch;
        if (delta < 500 && delta > 0)
        {
            event.preventDefault();
            return false;
        }
        iLastTouch = iNow;
    }, false);
}

//iScroll 上拉更多，下拉刷新
function initiScroll(parms){
    var me = {};
    me.parms = parms?parms:{
        className:'',
        pagenation:false,
        pullUpCallBak:function(){//上拉
        },
        pullDownCallBak:function(){//下拉
        }
    }
    if(parms.className){
        me.iSroller = new IScroll('.'+me.parms.className, {
            probeType: 3,
            scrollbars: true,
            mouseWheel: true,
            interactiveScrollbars: true,
            shrinkScrollbars: 'scale',
            fadeScrollbars: true
        });
        if(parms.pagenation){
            me.iSroller.pullDown = $('<div class="scroller-pullDown"><span class="pull-down-icon down-icon"></span><span class="pull-down-msg">下拉刷新</span><span class="loading"></span></div>');
            me.iSroller.downIcon = me.iSroller.pullDown.find('.down-icon');
            me.iSroller.downMsg = me.iSroller.pullDown.find('.pull-down-msg');

            me.iSroller.pullUp = $('<div class="scroller-pullUp"><span class="pull-up-icon up-icon"></span><span class="pull-up-msg">上拉查看更多</span><span class="loading"></span></div>'),
            me.iSroller.upIcon = me.iSroller.pullUp.find('.up-icon'),
            me.iSroller.upMsg = me.iSroller.pullUp.find('.pull-up-msg');

            me.iSrollerElment = $('.'+me.parms.className);
            me.iSrollerElment.children('div').eq(0).prepend(me.iSroller.pullDown).append(me.iSroller.pullUp);
            
            me.iSroller.on("scroll",function(){
                var y = this.y,
                    maxY = this.maxScrollY - y,
                    downHasClass = me.iSroller.downIcon.hasClass("reverse_icon"),
                    upHasClass = me.iSroller.upIcon.hasClass("reverse_icon");
                if(y >= 40){
                    !downHasClass && me.iSroller.downIcon.addClass("reverse_icon") && me.iSroller.downMsg.text('松手开始更新');
                    return "";
                }else if(y < 40 && y > 0){
                    downHasClass && me.iSroller.downIcon.removeClass("reverse_icon") && me.iSroller.downMsg.text('下拉刷新');
                    return "";
                }
                if(maxY >= 40){
                    !upHasClass && me.iSroller.upIcon.addClass("reverse_icon") && me.iSroller.upMsg.text('松手开始更新');
                    return "";
                }else if(maxY < 40 && maxY >=0){
                    upHasClass && me.iSroller.upIcon.removeClass("reverse_icon") && me.iSroller.upMsg.text('上拉查看更多');
                    return "";
                }
            });
            //上拉加载
            me.iSroller.on("slideUp",function(){
                if(this.maxScrollY - this.y > 40){
                    me.iSroller.pullUpStart();
                    me.parms.pullUpCallBak();
                }
            });
            //下拉刷新
            me.iSroller.on("slideDown",function(){
                if(this.y > 40){
                    me.iSroller.pullDownStart();
                    me.parms.pullDownCallBak();
                }
            });
            me.iSroller.pullDownStart = function(){
                me.iSroller.pullDown.addClass('active');
            }
            me.iSroller.pullDownEnd = function(){
                me.iSroller.pullDown.removeClass('active');
                //console.log('refresh');

                if(me.iSrollerElment.height()<=me.iSrollerElment.children('div').eq(0).height()){
                    me.iSroller.pullUp.addClass('show');
                }
                
                me.iSroller.refresh();
            }
            me.iSroller.pullUpStart = function(){
                me.iSroller.pullUp.addClass('active');
            }
            me.iSroller.pullUpEnd = function(){
                me.iSroller.pullUp.removeClass('active');
                //console.log('load more...');
                me.iSroller.refresh();
            }
        }
    }
    return me;
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
// Cookie.set('kk','45');
// console.log(Cookie.get());

//去空格
String.prototype.trim = function(){  
    return this.replace(/(^\s*)|(\s*$)/g, "");  
}  
String.prototype.Ltrim = function(){  
    return this.replace(/(^\s*)/g, "");  
}  
String.prototype.Rtrim = function(){  
    return this.replace(/(\s*$)/g, "");  
}

//AES 加解密，AES/CBC/PKCS5Padding
function AESCrypt(){
    var AESCrypt = {};

    AESCrypt.key = CryptoJS.enc.Utf8.parse("p4ssw0rdp4ssw0rd");  
    AESCrypt.iv  = CryptoJS.enc.Utf8.parse('16-Bytes--String'); 

    AESCrypt.Encrypt = function(word){
        srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, AESCrypt.key, { iv: AESCrypt.iv,mode:CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
        //return encrypted.ciphertext.toString().toUpperCase();//base64 16进制显示
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);//base64 字符显示
    }

    AESCrypt.Decrypt = function(word){  
        // var encryptedHexStr = CryptoJS.enc.Hex.parse(word);//base64 16进制转换
        // var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        var srcs = word;
        var decrypt = CryptoJS.AES.decrypt(srcs, AESCrypt.key, { iv: AESCrypt.iv,mode:CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7});
        var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8); 
        return decryptedStr.toString();
    }
    return AESCrypt;
}
// var mm = AESCrypt().Encrypt('{"userNo":"999999","orderStatus":"","pageNum":"1","pageSize":2}');
// console.log(mm);
// var jm = AESCrypt().Decrypt(mm);
// console.log(jm)