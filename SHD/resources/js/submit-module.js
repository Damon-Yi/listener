//Config = {
    //url: 'http://10.80.2.28:8080/bqjr-interview-web/',
    //url: 'http://10.80.2.112:8080/',
//url:'http://fpk.bqjr.cn/',
//    url: 'http://uat.fpk.bqjr.cn/',
//url: 'http://172.16.2.41:8080/',
//}
var elParser = window.elParser || {};
elParser = {
    init: function () {
        this.pageInit();
        this.globalInteraction();
    },
    urlData: getQueryStringArge(),
    hadStage: null,//当前阶段
    allPage: [],//所有页面
    pageNum: 0,//当前页
    totalPage: null,//界面总个数
    userInfo : getUserInfo(),
    //测试
    /*userInfo: {
        token: "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMzUyODc2NjUzNSIsImlhdCI6MTQ5NDIzNTQxMSwic3ViIjoiMTM1Mjg3NjY1MzUiLCJhdWQiOiJodWRhc2RmYnNkZGZ5ZnRyNzk5NSIsImV4cCI6MTQ5NDg0MDIxMX0.-8K3Oed0Qi-VV2-jKjPELlRzmt0_T8HAki7afIc7xB8",
        saNo: "B00140360",
        positionId: "123456"
    },*/
    loader: new loading({'container': document.body, 'hasBg': false}),
    gpsAdd: null,
    topTabSwiper: null,
    msbInfo: {
        info1: '系统故障，请重试。'
    },
    timeOut: undefined,
    pageInit: function () {
        var _this = this, arr = [];
        $.ajax({
            url: Config.url + 'system/initHomePage',
            type: 'POST',
            dataType: 'json',
            data: {'orderId': _this.urlData.orderId, 'orderType': _this.urlData.orderType},
            headers: {"token": _this.userInfo.token},
            success: function (data1) {
                _this.isLogOut(data1.ask, data1.errorMessage);
                var data = data1.data;
                _this.hadStage = data1.overStageList;
                _this.totalPage = data.length;
                if (data.length == 0) {
                    tips('初始化页面失败，请重试。(错误代码:' + data1.ask + ')', 'tips_center', 30000);
                    return;
                }
                //列出页码
                for (var i = 0; i < data.length; i++) {
                    _this.allPage.push(data[i].id)
                }

                arr.push('<div class="sub-nav">');
                arr.push('<div class="sub-topbg"></div>');
                arr.push('<div class="swiper-container">');
                arr.push('<div class="swiper-wrapper">');
                for (var i = 0; i < data.length; i++) {
                    arr.push('<div class="swiper-slide" data-pageid="' + data[i].id + '" data-stageid="' + data[i].stageId + '" data-lastpageflag="' + data[i].lastPageFlag + '"><div class="slide-item">' + data[i].pageName + '</div><div class="action-line"></div></div>');
                }
                arr.push('</div>');
                arr.push('<div class="nav-pagination"></div>');
                arr.push('</div>');
                arr.push('<div class="nav-arrows fbox cen">');
                arr.push('<div class="nav-button-prev"></div>');
                arr.push('<div class="flex1"></div>');
                arr.push('<div class="nav-button-next"></div>');
                arr.push('</div>');
                arr.push('</div>');
                arr.push('<div class="main-wrap"></div>');
                arr.push('<div class="footer-wrap">');

                arr.push('</div>');
                $('.page-wrap').prepend(arr.join(''));

                topTabSwiper = new Swiper('.sub-nav .swiper-container', {
                    slidesPerView: 4,
                    onInit: function (swiper) {
                        // 初始化小圆点
                        var n = _this.totalPage, navPagination = $('.nav-pagination'), arr = [];
                        for (var i = 0; i < n; i++) {
                            arr.push('<div></div>');
                        }
                        navPagination.append(arr.join(''));
                        //根据URL的界面编号选定轮播
                        $('.sub-nav .swiper-slide').eq(elParser.pageNum).addClass('on');
                        $('.sub-nav .nav-pagination>div').eq(elParser.pageNum).addClass('on');
                    }
                });

                _this.getElList({"pageId": _this.allPage[_this.pageNum], "orderId": _this.urlData.orderId});


            },
            error: function (data) {
                tips(_this.msbInfo.info1, 'tips_center', 10000);
            }
        })

    },
    getElList: function (data) {
        var _this = this;
        $.ajax({
            url: Config.url + 'system/getElementByPageId',
            type: 'GET',
            dataType: 'json',
            data: data,
            headers: {"token": _this.userInfo.token},
            beforeSend: function () {
                _this.loader.show();
            },
            complete: function () {
                _this.loader.hide();
            },
            success: function (data) {
                _this.isLogOut(data.ask, data.errorMessage);
                if (data.ask == (-1)) {
                    tips('获取页面元素列表失败，请重试。(错误代码:' + data.ask + ')', 'tips_center', 10000);
                    return;
                }
                var savePages = data.extData;
                var els = data.data.elementList, arr = [];
                arr.push('<div class="pd-tb-20">');
                for (var i = 0; i < els.length; i++) {
                    switch (els[i].elementType) {
                        case 'title':
                            arr.push(_this.lib.title(els[i].lableTitle, 'id' + els[i].id, 0, '', els[i].validateParam, els[i].styles));
                            break;
                        case 'text':
                            arr.push(_this.lib.text(els[i].lableTitle, els[i].elementType, els[i].styles, 'id' + els[i].id, els[i].valueStr, els[i].validateParam, els[i].rule, els[i].beltCode));
                            break;
                        case 'number':
                            arr.push(_this.lib.number(els[i].lableTitle, els[i].elementType, els[i].styles, 'id' + els[i].id, els[i].valueStr, els[i].validateParam, els[i].rule, els[i].beltCode));
                            break;
                        case 'label':
                            arr.push(_this.lib.label(els[i].lableTitle, els[i].valueStr, els[i].elementType, 'id' + els[i].id, els[i].beltCode));
                            break;
                        case 'labelUpDown':
                            arr.push(_this.lib.labelUpDown(els[i].lableTitle, els[i].valueStr, els[i].elementType, 'id' + els[i].id, els[i].beltCode));
                            break;
                        case 'space':
                            arr.push(_this.lib.space(1));
                            break;
                        case 'select':
                            arr.push(_this.lib.select(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].requestUrl, els[i].valueStr, els[i].validateParam, els[i].rule));
                            break;
                        case 'select2':
                            arr.push(_this.lib.select2(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].requestUrl, els[i].valueStr, els[i].validateParam));
                            break;
                        case 'dateRange':
                            arr.push(_this.lib.dateRange(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].valueStr, els[i].validateParam));
                            break;
                        case 'idDate':
                            arr.push(_this.lib.idDate(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].valueStr, els[i].validateParam));
                            break;
                        case 'date':
                            arr.push(_this.lib.date(els[i].lableTitle, els[i].elementType, els[i].styles, 'id' + els[i].id, els[i].valueStr, els[i].validateParam, els[i].rule));
                            break;
                        case 'year':
                            arr.push(_this.lib.year(els[i].lableTitle, els[i].styles, 'id' + els[i].id, els[i].validateParam));
                            break;
                        case 'day':
                            arr.push(_this.lib.day(els[i].lableTitle, els[i].styles, 'id' + els[i].id, els[i].validateParam));
                            break;
                        case 'selectOne':
                            arr.push(_this.lib.selectOne(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].valueStr, els[i].validateParam, els[i].rule));
                            break;
                        case 'moreOfOne':
                            arr.push(_this.lib.moreOfOne(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].valueStr, els[i].validateParam, els[i].rule, els[i].beltCode));
                            break;
                        case 'moreOfOneUpDown':
                            arr.push(_this.lib.moreOfOneUpDown(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].valueStr, els[i].beltCode, els[i].validateParam, els[i].rule));
                            break;
                        case 'moreOfOneUpDownOther':
                            arr.push(_this.lib.moreOfOneUpDownOther(els[i].lableTitle, 'id' + els[i].id, els[i].multipleValueContent, els[i].elementType, els[i].styles, els[i].valueStr, els[i].beltCode, els[i].validateParam, els[i].rule));
                            break;
                        case 'numberSelect':
                            arr.push(_this.lib.numberSelect(els[i].lableTitle, 'id' + els[i].id, els[i].elementType, els[i].valueStr, els[i].validateParam));
                            break;
                        case 'earaUpDown':
                            arr.push(_this.lib.earaUpDown(2, els[i].lableTitle, 'id' + els[i].id, els[i].elementType, els[i].valueStr, els[i].validateParam, els[i].rule));
                            break;
                        case 'imgCol2':
                            arr.push(_this.lib.imgCol2(els[i].lableTitle, 'id' + els[i].id, true, els[i].elementType, els[i].valueCode, els[i].styles, els[i].valueStr, els[i].validateParam, els[i].rule));
                            break;
                        case 'imgCol1':
                            arr.push(_this.lib.imgCol1(els[i].lableTitle, 'id' + els[i].id, els[i].elementType, els[i].valueCode, els[i].styles, els[i].valueStr, els[i].validateParam, els[i].rule));
                            break;
                        case 'imgMore':
                            arr.push(_this.lib.imgMore(els[i].lableTitle, 'id' + els[i].id, els[i].valueStr, els[i].elementType, els[i].valueCode, els[i].styles, els[i].validateParam, els[i].rule));
                            break;
                        case 'otherE2':
                            arr.push(_this.lib.otherE2(els[i].lableTitle, 'id' + els[i].id));
                            break;
                        case 'btn':
                            arr.push(_this.lib.btn(els[i].lableTitle, 'id' + els[i].id, els[i].elementType, els[i].styles, els[i].requestUrl));
                            break;
                        case 'selectOne':
                            arr.push(_this.lib.selectOne('id' + els[i].id, els[i].multipleValueContent));
                            break;
                    }
                }

                arr.push('</div>');

                //公共属性
                if (!!data.commElementObj) {
                    for (var q in data.commElementObj)
                        arr.push('<div id="id' + q + '"><div class="radio-js"><div class="text-center on" data-itemno="' + data.commElementObj[q] + '"></div></div></div>')
                }

                $('.main-wrap').empty().scrollTop(0).append(arr.join(''));


                //最后一个页面和其它页面底部的按钮不一样
                if (_this.pageNum + 1 == _this.totalPage) {
                    $('.footer-wrap').empty().append('<div class="group2"><a class="b-btn" id="cancel" href="javascript:;">取消申请</a><a class="b-btn" id="submit" href="javascript:;">提交申请</a></div>')
                } else {
                    $('.footer-wrap').empty().append('<div class="group1"><a class="b-btn" id="save-btn" href="javascript:;">保存</a></div>')
                }

                //显示的联动
                $('*[data-linkfor]').each(function (i, el) {
                    var linkFor = eval('(' + $(el).attr('data-linkfor') + ')');
                    for (var n in linkFor) {
                        if ($.inArray($('#id' + n).find('.radio-js>.on').attr('data-itemno'), linkFor[n]) > -1) {
                            $(el).removeClass('dn');
                        } else {
                            $(el).addClass('dn');
                        }

                    }
                })


                //select2 select
                if ($('*[data-etype="select2"]').length > 0) {
                    $('*[data-etype="select2"]').each(function (i, e) {
                        var one = $(e).find('*[data-requesturl]').eq(0);
                        var two = $(e).find('*[data-requesturl]').eq(1);
                        //是否保存过值
                        if ($(e).attr('data-val')) {
                            var dataVal = $(e).attr('data-val').split(',');
                            $.ajax({
                                url: $(one).attr('data-requesturl'),
                                type: 'get',
                                success: function (data) {
                                    var arr = [];
                                    var data1 = data.data;
                                    if (data1) {
                                        for (var i = 0; i < data1.length; i++) {
                                            arr.push('<option value="' + data1[i].code + '">' + data1[i].name + '</option>');
                                        }
                                    }
                                    $(one).append(arr.join(''));
                                    //填值
                                    $(one).val(dataVal[0]);
                                    $(one).trigger('change');

                                },
                                error: function () {
                                    console.log('select2出错')
                                }
                            });
                            $(one).change(function () {
                                $.ajax({
                                    url: $(two).attr('data-requesturl'),
                                    type: 'get',
                                    data: {'p1': $(one).val()},
                                    success: function (data) {
                                        var arr = [];
                                        var data1 = data.data;
                                        if (data1) {
                                            for (var i = 0; i < data1.length; i++) {
                                                arr.push('<option value="' + data1[i].code + '">' + data1[i].name + '</option>');
                                            }
                                        }
                                        $(two).empty().append(arr.join(''));
                                        if ($(one).val() == dataVal[0]) {
                                            $(two).val(dataVal[1]);
                                        } else {
                                            $(two).val("0")
                                            $(two).children().eq(0).attr('selected', 'selected')

                                            //$('#demo option:eq(1)').attr('selected','selected');
                                        }


                                    },
                                    error: function () {
                                        console.log('select2出错')
                                    }
                                });
                            })
                        } else {
                            $.ajax({
                                url: $(one).attr('data-requesturl'),
                                type: 'get',
                                success: function (data) {
                                    var arr = [];
                                    var data1 = data.data;
                                    if (data1) {
                                        for (var i = 0; i < data1.length; i++) {
                                            arr.push('<option value="' + data1[i].code + '">' + data1[i].name + '</option>');
                                        }
                                    }
                                    $(one).append(arr.join(''));
                                    //填值
                                    $(one).children().eq(0).attr('selected', 'selected');
                                    $(one).trigger('change');


                                },
                                error: function () {
                                    console.log('select2出错')
                                }
                            });
                            $(one).change(function () {
                                $.ajax({
                                    url: $(two).attr('data-requesturl'),
                                    type: 'get',
                                    data: {'p1': $(one).val()},
                                    success: function (data) {
                                        var arr = [];
                                        var data1 = data.data;
                                        if (data1) {
                                            for (var i = 0; i < data1.length; i++) {
                                                arr.push('<option value="' + data1[i].code + '">' + data1[i].name + '</option>');
                                            }
                                        }
                                        $(two).empty().append(arr.join(''));
                                        $(two).children().eq(0).attr('selected', 'selected');


                                    },
                                    error: function () {
                                        console.log('select2出错')
                                    }
                                });
                            })
                        }


                    })
                }

                if ($('*[data-etype="select"]').length > 0) {
                    $('*[data-etype="select"]').each(function (i, e) {
                        var _that = $(e).find('*[data-requesturl]');
                        if (!!$(_that).attr('data-contactid')) {
                            var contactId = $(_that).attr('data-contactid').split(',');
                            var val = $(e).attr('data-val');
                            //关联的select change到本select
                            for (var m = 0; m < contactId.length; m++) {
                                $('#id' + contactId[m]).find('.select-cs').change(function () {
                                    setTimeout(function () {
                                        fillSelect();
                                    }, 300)
                                })
                            }

                            function fillSelect() {
                                var arr = [];
                                for (var i = 0; i < contactId.length; i++) {
                                    $('#id' + contactId[i]).find('.select-cs').each(function (i, e) {
                                        arr.push($(e).val())
                                    })
                                }
                                var params = {};
                                for (var n = 0; n < arr.length; n++) {
                                    params['p' + (n + 1)] = arr[n];
                                }
                                console.log(params)

                                $.ajax({
                                    url: $(_that).attr('data-requesturl'),
                                    type: 'get',
                                    data: params,
                                    success: function (data) {
                                        var arr = [];
                                        var data1 = data.data;
                                        if (data1) {
                                            for (var i = 0; i < data1.length; i++) {
                                                arr.push('<option value="' + data1[i].code + '">' + data1[i].name + '</option>');
                                            }
                                        }
                                        $(_that).empty().append(arr.join(''));
                                        if (val) {
                                            $(_that).val(val)
                                        }
                                    },
                                    error: function () {
                                        console.log('select1出错')
                                    }
                                });
                            }

                        }


                    })
                }


                //界面权限控制
                topTabSwiper.on('Tap', function (swiper) {
                    var currPageid = +$(topTabSwiper.clickedSlide).attr('data-pageid');
                    var prevPageid = +$(topTabSwiper.clickedSlide).prev().attr('data-pageid');
                    var currStageid = +$(topTabSwiper.clickedSlide).attr('data-stageid');
                    var prevStageid = +$(topTabSwiper.clickedSlide).prev().attr('data-stageid');
                    var nextStageid = +$(topTabSwiper.clickedSlide).next().attr('data-stageid');
                    //如果当前界面或前一个页面存在于savePages
                    if (($.inArray(currPageid, savePages) >= 0 || $.inArray(prevPageid, savePages) >= 0)) {
                        //同时满足：1、tab不是第一个，2、当前tab阶段不等于上一tab阶段，3、上一tab阶段没保存轨迹 则不可点
                        if ($(topTabSwiper.clickedSlide).index() != 0 && currStageid != prevStageid && $.inArray(prevStageid, _this.hadStage) < 0) {
                            return;
                        }

                        if (!$(topTabSwiper.clickedSlide).hasClass('on')) {
                            $(topTabSwiper.clickedSlide).addClass('on').siblings().removeClass('on');
                            $('.nav-pagination div').eq(topTabSwiper.clickedIndex).addClass('on').siblings().removeClass('on');
                            _this.pageNum = topTabSwiper.clickedIndex;
                            var data = {
                                pageId: _this.allPage[_this.pageNum],
                                orderId: _this.urlData.orderId
                            }
                            _this.getElList(data);

                        }


                    }

                })

                //阶段不可编辑权限控制
                var current = $('.sub-nav .swiper-slide.on').attr('data-stageid');
                //如果当前阶段已记录过轨迹
                if ($.inArray(+current, _this.hadStage) >= 0) {
                    //文本域不可编辑
                    $('.main-wrap').find('textarea').attr('readonly', 'readonly');
                    //文本不可编辑
                    $('.main-wrap').find('input').attr('readonly', 'readonly').focus(function () {
                        $(this).blur()
                        //$(this).attr('onclick', '')
                    });
                    //下拉框不可编辑
                    $('.main-wrap').find('select').attr('disabled', 'disabled')
                    //按钮变灰
                    $('.b-btn').addClass('disabled')
                    //照片没有删除按钮
                    $('.info_img').prev().remove();
                    $('*[data-etype="btn"]').find('a').attr('href', 'javascript:;')
                    return;
                } else {
                    _this.pageInteraction();
                }


            },
            error: function (data) {
                tips(_this.msbInfo.info1, 'tips_center', 30000);
            }
        })
        var mainScroll;
    },
    globalInteraction: function () {
        $(document)
        /*点击查看大图*/
            .on("tap", ".info_img img", function () {
                var bigImg = myLayer({
                    'layerCont': $(this),
                    'hasShadowBg': true,
                    'shadowClose': true,
                    'funcs': {
                        ".layer_cont_wrap": function () {
                            bigImg.destory();
                        }
                    }
                });
                bigImg.show();
            })

            //照片关闭按钮
            .on('tap', '.close-btn', function (e) {
                $(this).next().remove();
                $(this).remove();
            })

            //日期类元素删除焦点
            .on('focus', '*[data-etype="date"] input', function () {
                $(this).blur();
            })

            //日期类 取消 确定
            .on('touchend', '.gearDate .date_btn:first-child', function (e) {
                e.preventDefault();
                times.cancelDateEdit();
            })
            .on('touchend', '.gearDate .date_btn:first-child+div', function (e) {
                e.preventDefault();
                times.finishDateEdit();
            })
    },
    pageInteraction: function () {
        var _this = this;

        //上传照片
        $('*[data-etype="imgCol1"],*[data-etype="imgCol2"],*[data-etype="imgMore"]').on('tap', '.w08', function () {
            var valueCode = $(this).parents('div[data-ecode]').attr('data-ecode');
            var orderId = elParser.urlData.orderId;

            if (isAndroid()) {
                //1 valueCode原ID
                //2 valueCode
                //3 orderId
                window.demo.clickOnAndroid(valueCode, valueCode, orderId);
            } else if (isIOS()) {
                mobile.takeLoanPhoto(valueCode, valueCode, orderId);
            }

        });

        //增加照片
        $('*[data-etype="imgMore"]').on('tap', '.addpic', function (e) {
            var ruleNum = eval("(" + $(this).closest('*[data-etype]').attr('data-rule') + ")").pic.split(',');
            var mapbox = $(this).closest('.mapbox');
            var tit = mapbox.attr("data-tit");
            var dataEcode = mapbox.attr("data-ecode");
            var imgMoreN = +mapbox.attr("data-enum");
            if (mapbox.siblings().length < ruleNum[1]) {
                imgMoreN++;
                mapbox.before('<div class="mapbox text-center" data-ecode="' + dataEcode + imgMoreN + '"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>' + tit + '</div></div><div class="photo"></div></div></div>');
                if (mapbox.siblings().length == ruleNum[1]) {
                    mapbox.remove()
                }

                mapbox.attr('data-enum', imgMoreN);

            }
        })

        //单选
        $('.radio-js>div').on('tap', function () {
            if ($(this).hasClass('on')) {
                $(this).removeClass('on');
                //其它
                if ($(this).text() == '其它') {
                    $(this).parent().find('.bc-e1').addClass('dn').val('');
                }
            } else {
                $(this).addClass('on').siblings().removeClass('on');
                //其它
                if ($(this).text() == '其它') {
                    $(this).parent().find('.bc-e1').removeClass('dn');
                } else {
                    $(this).parent().find('.bc-e1').addClass('dn').val('');
                }
            }
        })
        $('.diff-val>*').on('tap', function (e) {
            $(this).addClass('on');
            $(this).siblings().removeClass('on');
            $(this).siblings().find('.radio-s3').children().removeClass('on');
        })

        //数字加减
        $('.select-num').on('tap', 'div:first-child', function (e) {
                var obj = {};
                try {
                    obj.nVal = +$(this).parent().children().eq(1).text();
                    if (obj.nVal > 0) {
                        obj.nVal--;
                        $(this).parent().children().eq(1).text(obj.nVal);
                        delete obj.nVal;
                    }
                } catch (e) {
                }
            })
            .on('tap', 'div:last-child', function (e) {
                var obj = {};
                try {
                    obj.nVal = +$(this).parent().children().eq(1).text();
                    obj.nVal++;
                    $(this).parent().children().eq(1).text(obj.nVal);
                    delete obj.nVal;
                } catch (e) {
                }
            })

        //保存和取消
        $('#save-btn,#submit').on('tap', function () {
            _this.saveData(1);
        })
        $('#cancel').on('tap', function () {
            location.href = 'order_cancel.html?order=' + _this.urlData.orderId;

        })

        //时间弹出事件
        $('*[data-etype="date"]').find('input').tap(function(event){
            times.yearMonthDay(event);
        })

        //是否必填联动
        $('*[data-linkfor]').each(function (i, el) {
            var linkFor = eval('(' + $(el).attr('data-linkfor') + ')');
            for (var n in linkFor) {
                $('#id' + n).on('tap', '*[data-itemno]', function (e) {
                    //如果存在
                    if ($.inArray($(this).attr('data-itemno'), linkFor[n].split(',')) > -1) {
                        $(el).removeClass('dn');
                    } else {
                        $(el).addClass('dn');
                    }

                })
            }
        })

        //带请求的按钮
        $('*[data-etype="btn"]').on('tap', '*[data-postparam]', function () {
            var url = $(this).attr('data-requesturl');
            var params = eval("(" + $(this).attr('data-postparam') + ")");
            var data = {};
            for (var i in params) {
                if (params[i].charAt(0) == "#") {
                    data[i] = eval(params[i].replace("#", ""));
                } else {
                    data[i] = params[i];
                }
            }
            //alert(JSON.stringify(data))
            $.ajax({
                type: "post",
                url: url,
                data: data,
                //headers: {"token":userInfo.token},
                beforeSend: function (xhr, settings) {
                    _this.loader.show();
                },
                complete: function (xhr, status) {
                    _this.loader.hide();
                },
                success: function (data, status, xhr) {
                    //alert(data.ask)
                    if (data.ask == 0) {
                        if (data.data) {
                            if (isAndroid()) {
                                android2.share(data.data);
                            } else if (isIOS()) {
                                mobile.share(data.data);
                            }
                        }
                    } else {
                        tips('错误代码：' + data.ask, 'tips_center', 5000);
                    }
                },
                error: function (xhr, errorType, error) {
                    alert('请求失败')
                }
            });

        })

        //计算年龄
        $('*[data-age]').each(function (i, e) {
            $(e).find('input').attr('readonly','readonly').focus(function(){
                $(this).blur();
            })
            var forId = document.getElementById('id' + e.getAttribute('data-age'));
            var rule = eval('(' + forId.getAttribute('data-rule') + ')').reg;
                $(forId).find('input').blur(function(){
                    if (rule.test(this.value)) {
                        //获取年龄
                        var myDate = new Date();
                        var month = myDate.getMonth() + 1;
                        var day = myDate.getDate();
                        var age = myDate.getFullYear() - this.value.substring(6, 10) - 1;
                        if (this.value.substring(10, 12) < month || this.value.substring(10, 12) == month && this.value.substring(12, 14) <= day) {
                            age++;
                        }
                        e.getElementsByTagName('input')[0].value=age;
                    }
                })
        })

        //计算性别
        $('*[data-gender]').each(function (i, e) {
            $(e).find('*[data-itemno]').unbind();
            var forId = document.getElementById('id' + e.getAttribute('data-gender'));
            var rule = eval('(' + forId.getAttribute('data-rule') + ')').reg;
            $(forId).find('input').blur(function(){
                if (rule.test(this.value)) {
                    //获取性别
                    if (15 == this.value.length) {
                        var gender=parseInt(this.value.charAt(14) / 2) * 2 != this.value.charAt(14)?'男':'女';
                    } else if (18 == this.value.length) {
                        var gender=parseInt(this.value.charAt(16) / 2) * 2 != this.value.charAt(16)?'男':'女';
                    }
                    var childNodes =e.getElementsByClassName('radio-js')[0].childNodes;
                    for(var i in childNodes){
                        if(childNodes[i].innerText==gender){
                            $(childNodes[i]).addClass('on').siblings().removeClass('on');
                            break;
                        }
                    }

                }
            })
        })

    },
    getInfoFromMobile: function (str, valueCode) {
        //alert(valueCode)
        var _this = this;
        $('*[data-ecode="' + valueCode + '"]').find('.photo').empty().append('<div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="' + str + '?' + Date.parse(new Date()) + '"></div>');
        _this.saveData(0);

    },
    getGps: function (add) {
        var _this = this;
        //alert(add)
        if (_this.gpsAdd == add)return;
        $.ajax({
            url: Config.url + 'system/updateReservation',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({'orderNo': _this.urlData.orderId, 'interviewAddr': add}),
            headers: {"token": _this.userInfo.token},
            success: function (data) {
                _this.isLogOut(data.ask, data.errorMessage);
                console.log('GPS位置记录成功')
            }
        })
        _this.gpsAdd = add;
    },
    saveData: function (o) {//0调的摄像头 1点的保存
        var _this = this;
        var es = $('*[id^="id"]:not([class*="dn"])');

        var data = {
            orderId: _this.urlData.orderId,
            pageId: _this.allPage[_this.pageNum],
            valueJson: {}
        };
        for (var i in es) {

            if (es.eq(i).attr("data-rule") && o) {
                var rule = eval("(" + es.eq(i).attr("data-rule") + ")");
                if (rule) {
                    var reg = rule.reg,
                        choice = rule.choice,
                        pics = rule.pic;
                    if (reg) {
                        if (!eval(reg).test(es.eq(i).find('input,textarea,select').val())) {
                            tips(es.eq(i).find('.js-tit').text() + '格式错误', 'tips_center', 2500);
                            return;
                        }
                    }
                    if (choice) {
                        if (es.eq(i).find('.radio-js>div.on').length < +choice) {
                            tips(es.eq(i).find('.js-tit').text() + '必需选择', 'tips_center', 2500);
                            return;
                        }
                    }
                    if (pics) {
                        var pic = pics.split(',');
                        if (es.eq(i).find('.info_img').length < +pic[0]) {
                            tips(es.eq(i).find('.js-tit').text() + '不得小于' + pic[0] + '张', 'tips_center', 2500);
                            return;
                        }
                    }
                }

            }

        }

        for (var i in es) {
            switch (es.eq(i).attr("data-etype")) {
                case 'label':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.txt-right').text();
                    break;
                case 'labelUpDown':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.txt-right').text();
                    break;
                case 'number':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('input').val();
                    break;
                case 'text':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('input').val();
                    break;
                case 'date':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('input').val();
                    break;
                case 'selectOne':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.radio-js>div.on').attr('data-itemno');
                    break;
                case 'moreOfOne':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.radio-js>div.on').attr('data-itemno');
                    break;
                case 'moreOfOneUpDown':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.radio-js>div.on').attr('data-itemno');
                    break;
                case 'select':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.select-cs').val();
                    break;
                case 'select2':
                    var selectCs = es.eq(i).find('.select-cs');
                    var val = [selectCs.eq(0)[0].options[selectCs.eq(0)[0].selectedIndex].text, selectCs.eq(1)[0].value];
                    //var val = [selectCs.eq(0)[0].options[selectCs.eq(0)[0].selectedIndex].text, selectCs.eq(1)[0].value, selectCs.eq(0)[0].selectedIndex, selectCs.eq(1)[0].selectedIndex];
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = val;
                    break;
                case 'moreOfOneUpDownOther':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = [es.eq(i).find('.radio-js>div.on').attr('data-itemno'), es.eq(i).find('.bc-e1').val()];
                    break;
                case 'earaUpDown':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('textarea').val();
                    break;
                case 'imgCol1':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = [es.eq(i).find('.photo>.info_img>img').attr('src') || ''];
                    break;
                case 'imgCol2':
                    var e = es.eq(i).find('.photo'), arr = [];
                    for (var m = 0; m < 2; m++) {
                        arr.push(e.eq(m).find('img').attr('src') || '')
                    }
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = arr;
                    break;
                case 'imgMore':
                    var e = es.eq(i).find('.photo'), arr = [];
                    for (var p = 0; p < e.length; p++) {
                        arr.push(e.eq(p).find('img').attr('src') || '')
                    }
                    for (var c = 0; c < arr.length; c++) {
                        if (arr[c] == "") {
                            arr.splice(c, 1);
                            c = c - 1;
                        }

                    }
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = arr;
                    break;
                case 'numberSelect':
                    data.valueJson[es.eq(i).attr('id').replace('id', '')] = es.eq(i).find('.select-num').children().eq(1).text();
                    break;

            }
        }


        console.log(JSON.stringify(data))
        $.ajax({
            url: Config.url + 'system/savePageValue',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify(data),
            headers: {"token": _this.userInfo.token},
            beforeSend: function () {
                _this.loader.show();
            },
            complete: function () {
                _this.loader.hide();
            },
            success: function (data) {
                _this.isLogOut(data.ask, data.errorMessage);
                if (data.ask != -1) {
                    if (!o)return;
                    var $current = $('.sub-nav .swiper-slide.on');
                    //保存分支
                    switch (_this.urlData.orderType) {
                        case 'ED':
                            //每一阶段最后一个界面
                            if ($current.attr('data-lastpageflag') == 'true') {
                                //如果是第一阶段 记录GPS位置
                                if ($current.attr('data-stageid') === $('.sub-nav .swiper-slide').eq(0).attr('data-stageid')) {
                                    try {
                                        getGpsNow();
                                    }
                                    catch (e) {
                                        //alert('获取GPS地址失败')
                                    }
                                }

                                //是最后一个阶段
                                if (_this.pageNum + 1 == _this.totalPage) {

                                    var dialog = confirmDialog({
                                        type: 2,
                                        hasShadowBg: true,
                                        title: '提示',
                                        txt: '保存成功。现在是否提交申请？',
                                        btns: [{
                                            text: '取消',
                                            callBack: function () {
                                                dialog.destory();
                                                return;
                                            }
                                        },
                                            {
                                                text: '确定',
                                                callBack: function () {
                                                    //记录阶段结束轨迹
                                                    $.ajax({
                                                        url: Config.url + 'system/saveOrderTrack',
                                                        type: 'POST',
                                                        async: false,
                                                        contentType: "application/json",
                                                        data: JSON.stringify({'orderId': _this.urlData.orderId, 'stageId': $current.attr('data-stageid')}),
                                                        headers: {"token": _this.userInfo.token},
                                                        success: function (data) {
                                                            _this.isLogOut(data.ask, data.errorMessage);
                                                            console.log('轨迹记录成功')
                                                        }
                                                    })

                                                    //订单状态改变
                                                    $.ajax({
                                                        type: "post",
                                                        url: Config.url + "orderInfo/submitOrder",
                                                        contentType: "application/json",
                                                        data: JSON.stringify({"userNo": _this.userInfo.saNo, "orderNo": _this.urlData.orderId}),
                                                        headers: {"token": _this.userInfo.token},
                                                        beforeSend: function () {
                                                            _this.loader.show();
                                                        },
                                                        complete: function () {
                                                            _this.loader.hide();
                                                        },
                                                        success: function (data, status, xhr) {
                                                            _this.isLogOut(data.ask, data.errorMessage);

                                                            location.href = 'orders.html?urltpe=50';

                                                        },
                                                        error: function (xhr, errorType, error) {
                                                            alert('保存失败')
                                                        }
                                                    })
                                                    dialog.destory();
                                                }
                                            }
                                        ]
                                    });
                                    dialog.show();
                                } else if (_this.pageNum + 1 != _this.totalPage) {
                                    var dialog = confirmDialog({
                                        type: 2,
                                        hasShadowBg: true,
                                        title: '提示',
                                        txt: '保存成功！是否提交？提交后将不能修改。',
                                        btns: [{
                                            text: '我再看一下',
                                            callBack: function () {
                                                dialog.destory();
                                                return;
                                            }
                                        },
                                            {
                                                text: '提交',
                                                callBack: function () {
                                                    //记录阶段结束轨迹
                                                    $.ajax({
                                                        url: Config.url + 'system/saveOrderTrack',
                                                        type: 'POST',
                                                        async: false,
                                                        contentType: "application/json",
                                                        data: JSON.stringify({'orderId': _this.urlData.orderId, 'stageId': $current.attr('data-stageid')}),
                                                        headers: {"token": _this.userInfo.token},
                                                        success: function (data) {
                                                            _this.isLogOut(data.ask, data.errorMessage);
                                                            console.log('轨迹记录成功')
                                                            location.href = 'orders.html?urltpe=40'
                                                        },
                                                        error: function () {
                                                            console.log('轨迹记录失败')
                                                        }
                                                    })
                                                    dialog.destory();
                                                }
                                            }
                                        ]
                                    });
                                    dialog.show();
                                }

                            } else {
                                if (_this.pageNum + 1 == 1) {
                                    //第一个界面
                                    $.ajax({
                                        url: Config.url + 'system/deleteRemindPatch',
                                        type: 'POST',
                                        contentType: "application/json",
                                        data: JSON.stringify({'orderId': _this.urlData.orderId}),
                                        headers: {"token": _this.userInfo.token},
                                        success: function (data) {
                                            _this.isLogOut(data.ask, data.errorMessage);
                                            console.log('第一个界面deleteRemindPatch')
                                        }
                                    })
                                }
                                tips('保存成功！', 'tips_center', 2000);
                                //防止短时间触发多次
                                clearTimeout(_this.timeOut);
                                _this.timeOut = setTimeout(function () {
                                    _this.pageNum++;
                                    $('.sub-nav .swiper-slide').eq(_this.pageNum).addClass('on').siblings().removeClass('on');
                                    $('.nav-pagination div.on').next().addClass('on').siblings().removeClass('on');
                                    _this.getElList({"pageId": _this.allPage[_this.pageNum], "orderId": _this.urlData.orderId});
                                }, 2000)
                            }
                            break;
                        case 'SHD':
                            //每一阶段最后一个界面
                            if ($current.attr('data-lastpageflag') == 'true') {
                                //如果是第一阶段 记录GPS位置
                                if ($current.attr('data-stageid') === $('.sub-nav .swiper-slide').eq(0).attr('data-stageid')) {
                                    try {
                                        getGpsNow();
                                    }
                                    catch (e) {
                                        //alert('获取GPS地址失败')
                                    }
                                }

                                //是最后一个阶段
                                if (_this.pageNum + 1 == _this.totalPage) {

                                    var dialog = confirmDialog({
                                        type: 2,
                                        hasShadowBg: true,
                                        title: '提示',
                                        txt: '保存成功。现在是否提交申请？',
                                        btns: [{
                                            text: '取消',
                                            callBack: function () {
                                                dialog.destory();
                                            }
                                        },
                                            {
                                                text: '确定',
                                                callBack: function () {
                                                    //记录阶段结束轨迹
                                                    $.ajax({
                                                        url: Config.url + 'system/saveOrderTrack',
                                                        type: 'POST',
                                                        contentType: "application/json",
                                                        data: JSON.stringify({'orderId': _this.urlData.orderId, 'stageId': $current.attr('data-stageid')}),
                                                        headers: {"token": _this.userInfo.token},
                                                        success: function (data) {
                                                            _this.isLogOut(data.ask, data.errorMessage);
                                                            console.log('轨迹记录成功')
                                                        }
                                                    })

                                                    switch (+$('#id260 .radio-js>div.on').attr('data-itemno')) {
                                                        //1 电脑上传
                                                        //2 现在上传
                                                        case 1:
                                                            //发送消息提醒
                                                            $.ajax({
                                                                url: Config.url + 'orderInfo/uploadRemind',
                                                                type: 'get',
                                                                async: false,
                                                                contentType: "application/json",
                                                                data: {'orderNo': _this.urlData.orderId},
                                                                headers: {"token": _this.userInfo.token},
                                                                success: function (data) {
                                                                    _this.isLogOut(data.ask, data.errorMessage);
                                                                    //alert('发送消息提醒：去电脑上传银行流水');
                                                                },
                                                                error: function () {
                                                                    //alert(_this.msbInfo.info1)
                                                                }
                                                            })
                                                            break;
                                                        case 2:
                                                            //商户贷第二阶段提单
                                                            $.ajax({
                                                                url: Config.url + 'orderInfo/stageSubmit',
                                                                type: 'post',
                                                                data: {'orderNo': _this.urlData.orderId, 'stageId': $current.attr('data-stageid'), "isfinsh": 1, "userNo": _this.userInfo.saNo},
                                                                headers: {"token": _this.userInfo.token},
                                                                success: function (data) {
                                                                    _this.isLogOut(data.ask, data.errorMessage);
                                                                    console.log('商户贷第二阶段提单')

                                                                }
                                                            })

                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                    setTimeout(function () {
                                                        location.href = 'orders.html?urltpe=50';
                                                    }, 300)
                                                    dialog.destory();

                                                }
                                            }
                                        ]
                                    });
                                    dialog.show();
                                } else if (_this.pageNum + 1 != _this.totalPage) {
                                    var dialog = confirmDialog({
                                        type: 2,
                                        hasShadowBg: true,
                                        title: '提示',
                                        txt: '保存成功！是否提交？提交后将不能修改。',
                                        btns: [{
                                            text: '我再看一下',
                                            callBack: function () {
                                                dialog.destory();
                                                return;

                                            }
                                        },
                                            {
                                                text: '提交',
                                                callBack: function (e) {

                                                    //记录阶段结束轨迹
                                                    $.ajax({
                                                        url: Config.url + 'system/saveOrderTrack',
                                                        type: 'POST',
                                                        //async: false,
                                                        contentType: "application/json",
                                                        data: JSON.stringify({'orderId': _this.urlData.orderId, 'stageId': $current.attr('data-stageid')}),
                                                        headers: {"token": _this.userInfo.token},
                                                        success: function (data) {
                                                            _this.isLogOut(data.ask, data.errorMessage);
                                                            console.log('轨迹记录成功')
                                                        },
                                                        error: function () {
                                                            console.log('轨迹记录失败')
                                                        }
                                                    })
                                                    //商户贷第一阶段提单
                                                    $.ajax({
                                                        url: Config.url + 'orderInfo/stageSubmit',
                                                        type: 'post',
                                                        data: {'orderNo': _this.urlData.orderId, 'stageId': $current.attr('data-stageid'), "isfinsh": 0, "userNo": _this.userInfo.saNo},
                                                        headers: {"token": _this.userInfo.token},
                                                        success: function (data) {
                                                            _this.isLogOut(data.ask, data.errorMessage);
                                                            console.log('商户贷第一阶段提单')
                                                        }
                                                    })
                                                    setTimeout(function () {
                                                        location.href = 'orders.html?urltpe=40'
                                                    }, 300)

                                                    dialog.destory();
                                                }
                                            }
                                        ]
                                    });
                                    dialog.show();
                                }

                            } else {
                                if (_this.pageNum + 1 == 1) {
                                    //第一个界面
                                    $.ajax({
                                        url: Config.url + 'system/deleteRemindPatch',
                                        type: 'POST',
                                        contentType: "application/json",
                                        data: JSON.stringify({'orderId': _this.urlData.orderId}),
                                        headers: {"token": _this.userInfo.token},
                                        success: function (data) {
                                            _this.isLogOut(data.ask, data.errorMessage);
                                            console.log('第一个界面deleteRemindPatch')
                                        }
                                    })
                                }
                                tips('保存成功！', 'tips_center', 2000);
                                //防止短时间触发多次
                                clearTimeout(_this.timeOut);
                                _this.timeOut = setTimeout(function () {
                                    _this.pageNum++;
                                    $('.sub-nav .swiper-slide').eq(_this.pageNum).addClass('on').siblings().removeClass('on');
                                    $('.nav-pagination div.on').next().addClass('on').siblings().removeClass('on');
                                    _this.getElList({"pageId": _this.allPage[_this.pageNum], "orderId": _this.urlData.orderId});
                                }, 2000)
                            }
                            break;
                    }
                }
            },
            error: function (data) {
                alert('保存失败，请重试')
            }
        })

    },
    isLogOut: function (c, t) {
        if (c == (-2)) {
            tips(t, 'tips_center', 2000);
            setTimeout(function () {
                //logOut();
            }, 1500)
        }
    },

    lib: {
        title: function (l, id, hasImg, url, o, styles) {
            var arr = [];
            var styles = !!styles ? eval('(' + styles + ')') : '';

            arr.push('<div class="t1 pd-tb-20"' + (styles.m ? " data-m=" + styles.m : "") + ' id="' + id + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + '><span>' + l + '</span>')
            !+o[4] || arr.push('<span class="red">*</span>');
            if (hasImg) {
                arr.push('<div class="tit-ico"><img class="full-size vm" src="' + url + '"></div>')
            }
            arr.push('</div>')
            return arr.join('');


        },
        label: function (l, val, etype, id, belt) {
            var belt = belt == null ? '' : belt;
            var r = belt || val;
            return '<div class="pd-tb-20 fbox one_px_border_b" id="' + id + '" data-etype="' + etype + '"><div class="txt-left">' + l + '</div><div class="txt-right com_grey">' + r + '</div></div>';
        },
        labelUpDown: function (l, val, etype, id, belt) {
            var belt = belt == null ? '' : belt;
            var r = belt || val;
            var arr = [];
            arr.push('<div class="pd-tb-20 one_px_border_b" id="' + id + '" data-etype="' + etype + '"><div class="txt-left">');
            arr.push(l);
            arr.push('</div><div class="txt-right ml0">');
            arr.push(r);
            arr.push('</div></div>');
            return arr.join('');
        },
        text: function (l, etype, styles, id, val, o, rule, belt) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var belt = !!belt && belt != null ? belt : '';
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '" data-etype="' + etype + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : " ") + (!!styles.age ? " data-age=" + JSON.stringify(styles.age) : " ") + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark" type="text" ' + (styles.placeholder ? " placeholder=" + styles.placeholder : " ") + (!!+o[0] ? " " : " readonly") + (!!val ? " value=" + val : " value=" + belt) + '></div></div>');
            return arr.join('');
        },
        number: function (l, etype, styles, id, val, o, rule, belt) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var belt = !!belt && belt != null ? belt : '';
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '" data-etype="' + etype + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark" type="number" ' + (styles.placeholder ? " placeholder=" + styles.placeholder : " ") + (!!+o[0] ? " " : " readonly") + (!!val ? " value=" + val : " value=" + belt) + '></div></div>');
            return arr.join('');
        },
        password: function (l, p, id, o, regex) {
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b"><div class="txt-left">');
            arr.push(l);
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark" type="password" id="' + id + '" placeholder="' + p + '" onblur="' + regex + '.test(this.value) || console.log(\'格式错误\')"></div></div>');
            return arr.join('');
        },
        email: function (l, p, id, o, regex) {
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b"><div class="txt-left">');
            arr.push(l);
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark" type="email" id="' + id + '" placeholder="' + p + '" onblur="' + regex + '.test(this.value) || console.log(\'格式错误\')"></div></div>');
            return arr.join('');
        },
        date: function (l, etype, styles, id, val, o, rule) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '" data-etype="' + etype + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : " ") + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark select-cs" type="text" readonly ' + (styles.placeholder ? " placeholder=" + styles.placeholder : " ") + (!!val ? " value=" + val : " ") + '></div></div>');
            return arr.join('');
        },
        year: function (l, p, id, o) {
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '"><div class="txt-left"><span>');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark select-cs" type="date" id="' + id + '" placeholder="' + p + '"></div></div>');
            return arr.join('');
        },
        day: function (l, p, id, o) {
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '"><div class="txt-left"><span>');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><input class="input-box impor_dark select-cs" type="date" id="' + id + '" placeholder="' + p + '"></div></div>');
            return arr.join('');
        },
        select: function (l, id, option, etype, styles, url, val, o, rule) {
            var arr = [];
            var option = eval('(' + option + ')');
            var styles = !!styles ? eval('(' + styles + ')') : '';

            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '" data-etype="' + etype + '"' + (!!val && " data-val=" + val) + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div>');
            arr.push('<select class="txt-right select-cs impor_dark" ' + (+!!styles.contactId ? " data-contactId=" + styles.contactId : " ") + (+!!url ? " data-requesturl=" + url : " ") + '>');

            if (option) {
                //先列出所有值，再和val比较
                var allVal = [];
                for (var i = 0; i < option.length; i++) {
                    allVal.push(option[i].itemNo);
                }
                for (var n = 0; n < allVal.length; n++) {
                    if (allVal[n] == val) {
                        arr.push('<option value="' + option[n].itemNo + '" selected = "selected">' + option[n].itemName + '</option>');
                    } else {
                        arr.push('<option value="' + option[n].itemNo + '">' + option[n].itemName + '</option>');
                    }
                }
            }

            arr.push('</select>');
            arr.push('</div>');
            return arr.join('');
        },
        select2: function (l, id, option, etype, styles, url, val, o) {
            var url = !!url ? eval('(' + url + ')') : '';
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '" data-etype="' + etype + '"' + (!!val && " data-val=" + val) + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : " ") + '><div class="txt-left"><span>');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div>');
            arr.push('<select class="txt-right select-cs impor_dark" ' + (!!url ? " data-requesturl=\"" + url[0] + "\"" : " ") + '></select>');
            arr.push('<select class="txt-right select-cs impor_dark" ' + (!!url ? " data-requesturl=\"" + url[1] + "\"" : " ") + '></select>');
            arr.push('</div>');
            return arr.join('');
        },
        dateRange: function (l, id, option, etype, styles, val, o) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var arr = [];
            arr.push('<div class="pd-tb-20 one_px_border_b" id="' + id + '" data-etype="' + etype + '"><div class="txt-left">');
            arr.push(l);
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right ml0 fbox">');
            arr.push('<input class="input-box impor_dark select-date" type="date" placeholder="时间类型" onblur="/^\d$/.test(this.value) || console.log(\'格式错误\')">');
            arr.push('<div>至</div>');
            arr.push('<input class="input-box impor_dark select-date" type="date" placeholder="时间类型" onblur="/^\d$/.test(this.value) || console.log(\'格式错误\')">');
            //arr.push('<div class="box-red on">长期</div>');
            arr.push('</div></div>');
            return arr.join('');
        },
        idDate: function (l, id, option, etype, styles, val, o) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var arr = [];
            arr.push('<div class="pd-tb-20 one_px_border_b" id="' + id + '" id="' + id + '" data-etype="' + etype + '"><div class="txt-left">');
            arr.push(l);
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right pd-t10 ml0 fbox">');
            arr.push('<label class="input-box com_dark select-date" onClick="times.yearMonthDay(event);">开始时间</label>');
            arr.push('<div class="com_dark">至</div>');
            arr.push('<label class="input-box com_dark select-date" onClick="times.yearMonthDay(event);">结束时间</label>');
            arr.push('<div class="box-red">长期</div>');
            arr.push('</div></div>');
            return arr.join('');
        },
        moreOfOne: function (l, id, option, etype, styles, val, o, rule, belt) {
            var arr = [];
            var option = eval('(' + option + ')');
            var styles = !!styles ? eval('(' + styles + ')') : '';

            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b' + (+o[1] ? " dn" : "") + '" id="' + id + '" data-etype="' + etype + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "")+(!!styles.gender ? " data-gender=" + JSON.stringify(styles.gender) : "") + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right com_grey"><div class="radio-s1 radio-js fbox text-center">');

            if (option) {
                //先列出所有值，再和val比较
                var allVal = [];
                for (var i = 0; i < option.length; i++) {
                    allVal.push(option[i].itemNo);
                }
                //取值顺序
                //val
                //belt
                //default_value
                if (belt && val == '') {
                    val = belt;
                }
                if (styles.default_value && val == '') {
                    val = styles.default_value;
                }
                for (var n = 0; n < allVal.length; n++) {
                    if (allVal[n] == val) {
                        arr.push('<div class="on" data-itemno="' + option[n].itemNo + '">' + option[n].itemName + '</div>');
                    } else {
                        arr.push('<div data-itemno="' + option[n].itemNo + '">' + option[n].itemName + '</div>');
                    }
                }
            }
            arr.push('</div></div></div>');
            return arr.join('');
        },
        moreOfOneUpDown: function (l, id, option, etype, styles, val, belt, o, rule) {
            var arr = [];
            var option = eval('(' + option + ')');
            var styles = !!styles ? eval('(' + styles + ')') : '';

            arr.push('<div class="pd-t20 one_px_border_b' + (+o[1] ? " dn" : "") + '" id="' + id + '" data-etype="' + etype + '" ' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span><span class="red">');
            !+o[4] || arr.push('*');
            arr.push('</span>')
            arr.push('</div><div class="txt-right ml0 impor_dark"><div class="radio-s2 radio-js bi mt20">');
            if (option) {
                //先列出所有值，再和val比较
                var allVal = [];
                for (var i = 0; i < option.length; i++) {
                    allVal.push(option[i].itemNo);
                }
                if (styles.default_value && val == '') {
                    val = styles.default_value;
                }
                for (var n = 0; n < allVal.length; n++) {
                    if (allVal[n] == val) {
                        arr.push('<div class="text-center on" data-itemno="' + option[n].itemNo + '">' + option[n].itemName + '</div>');
                    } else {
                        arr.push('<div class="text-center" data-itemno="' + option[n].itemNo + '">' + option[n].itemName + '</div>');
                    }
                }
            }
            arr.push('</div>');
            //console.log(belt)
            if (belt && belt.length == 1) {
                arr.push('<div class="com_grey pb10">' + belt[0] + '</div>');
            } else if (belt && belt.length == 2 && (elParser.pageNum + 1) == elParser.totalPage) {
                arr.push('<div class="fbox pb10"><div class="flex1 mapbox text-center"><div class="tablev-no"><div class="photo"><div class="info_img"><img src="' + belt[0] + '"></div></div></div></div><div class="flex1 mapbox text-center ml2"><div class="tablev-no"><div class="photo"><div class="info_img"><img src="' + belt[1] + '"></div></div></div></div></div>');
            }

            arr.push('</div></div>');
            return arr.join('');
        },
        moreOfOneUpDownOther: function (l, id, option, etype, styles, val, belt, o, rule) {
            var arr = [];
            var option = eval('(' + option + ')');
            var styles = !!styles ? eval('(' + styles + ')') : '';
            arr.push('<div class="pd-t20 one_px_border_b" id="' + id + '" data-etype="' + etype + '"' + (rule ? " data-rule=" + rule : " ") + '><div class="txt-left"><span class="js-tit">');
            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right ml0 impor_dark"><div class="radio-s2 radio-js bi mt20">');

            if (option) {
                //先列出所有值，再和val比较
                var allVal = [];
                for (var i = 0; i < option.length; i++) {
                    allVal.push(option[i].itemNo);
                }
                for (var n = 0; n < allVal.length; n++) {
                    if (allVal[n] == val[0]) {
                        arr.push('<div class="text-center on" data-itemno="' + option[n].itemNo + '">' + option[n].itemName + '</div>');
                    } else {
                        arr.push('<div class="text-center" data-itemno="' + option[n].itemNo + '">' + option[n].itemName + '</div>');
                    }
                }
            }
            if (val[1]) {
                arr.push('<textarea class="full-size impor_dark bc-e1" rows="5">' + val[1] + '</textarea>');
            } else {
                arr.push('<textarea class="full-size impor_dark dn bc-e1" rows="5"></textarea>');
            }
            arr.push('</div></div></div>');
            return arr.join('');


        },
        selectOne: function (l, id, option, etype, styles, val, o, rule) {
            var option = eval('(' + option + ')');
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var arr = [];
            arr.push('<div id="' + id + '" class="' + (+o[1] ? " dn" : "") + '" data-etype="' + etype + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + (rule ? " data-rule=" + rule : " ") + '><div class="t1 pd-tb-20"><span class="js-tit">');

            arr.push(l);
            arr.push('</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-left radio-s4 radio-js fbox wrap">');

            if (option) {
                //先列出所有值，再和val比较
                var allVal = [];
                for (var i = 0; i < option.length; i++) {
                    allVal.push(option[i].itemNo);
                }
                for (var n = 0; n < allVal.length; n++) {
                    arr.push('<div class="fbox cen' + (allVal[n] == val ? " on" : "") + '" data-itemno="' + option[n].itemNo + '"><i></i><div class="ml1">' + option[n].itemName + '</div></div>');

                }
            }
            arr.push('</div></div>');
            return arr.join('');
        },
        numberSelect: function (l, id, etype, val, o) {
            var arr = [];
            arr.push('<div class="pd-tb-20 fbox cen one_px_border_b" id="' + id + '" data-etype="' + etype + '"><div class="txt-left">');
            arr.push(l);
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div><div class="txt-right"><div class="select-num fbox cen"><div class=""></div><div class="com_grey">' + (!!+val ? val : '0') + '</div><div class=""></div></div></div></div>');
            return arr.join('');
        },
        earaUpDown: function (tYype, l, id, etype, val, o, rule) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var arr = [];
            arr.push('<div class="pd-t20" id="' + id + '" data-etype="' + etype + '"' + (rule ? " data-rule=" + rule : " ") + '>');
            if (tYype == 1) {
                arr.push('<div class="t1 no-bl pd-tb-20">');
            } else if (tYype == 2) {
                arr.push('<div class="txt-left mb10"><span class="js-tit">');
            }
            arr.push(l);
            !+o[4] || arr.push('</span><span class="red">*</span>');
            arr.push('</div><textarea class="full-size impor_dark bc-e1" rows="5" maxlength="500">' + val + '</textarea></div>');
            return arr.join('');
        },
        space: function (type) {
            if (type == 1) {
                return '<div class="bold_border_b"></div>'
            } else if (type == 2) {
                return '<div class="down_space"></div>'
            }
        },
        imgCol1: function (l, id, etype, ecode, styles, val, o, rule) {
            var styles = !!styles ? eval('(' + styles + ')') : '';

            var arr = [];
            arr.push('<div id="' + id + '" data-etype="' + etype + '"' + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + (rule ? " data-rule=" + rule : " ") + '>');
            arr.push('<div class="t1 pd-tb-20"><span class="js-tit">' + l + '</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div>');
            arr.push('<div class="pd-tb-10 fbox"><div class="flex1 mapbox big text-center" data-ecode="' + ecode + '"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>');
            arr.push(styles.title || l);
            arr.push('</div></div><div class="photo">');
            if (val && val[0]) {
                arr.push('<div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="' + val + '"></div>');
            }
            arr.push('</div></div></div></div></div>');
            return arr.join('');
        },
        imgCol2: function (l, id, isSecond, etype, ecode, styles, val, o, rule) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            var tit = styles.title.split(',');
            var ecode = ecode.split(',');

            var arr = [];
            arr.push('<div id="' + id + '" data-etype="' + etype + '" ' + (styles.m ? " data-m=" + styles.m : "") + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + (rule ? " data-rule=" + rule : " ") + '>');
            arr.push('<div class="t1 pd-tb-20"><span class="js-tit">' + l + '</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div>');
            arr.push('<div class="pd-blr20 bi"><div class="mapbox text-center" data-ecode="' + ecode[0] + '"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>');
            arr.push(tit && tit[0]);
            arr.push('</div></div><div class="photo">');
            if (val && val[0]) {
                arr.push('<div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="' + val[0] + '"></div>');
            }
            arr.push('</div></div></div>');
            if (isSecond) {
                arr.push('<div class="mapbox text-center" data-ecode="' + ecode[1] + '"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>');
                arr.push(tit && tit[1]);
                arr.push('</div></div><div class="photo">');
                if (val && val[1]) {
                    arr.push('<div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="' + val[1] + '"></div>');
                }
                arr.push('</div></div></div></div></div>');
            }
            return arr.join('');
        },
        imgMore: function (l, id, val, etype, ecode, styles, o, rule) {
            var styles = !!styles ? eval('(' + styles + ')') : '';

            var arr = [];
            arr.push('<div id="' + id + '" data-etype="' + etype + '" ' + (styles.m ? " data-m=" + styles.m : "") + (!!styles.linkage ? " data-linkfor=" + JSON.stringify(styles.linkage) : "") + (rule ? " data-rule=" + rule : " ") + '>');

            arr.push('<div>');
            arr.push('<div class="t1 pd-tb-20"><span class="js-tit">' + l + '</span>');
            !+o[4] || arr.push('<span class="red">*</span>');
            arr.push('</div>');

            arr.push('<div class="pd-b20 bi" data-ecode="' + ecode + '">');
            if (val.length > 0) {
                var maxVal = val[val.length - 1];
                var numVal = +maxVal.substring(maxVal.indexOf(ecode) + ecode.length, maxVal.length).split('.')[0];
                for (var i = 0; i < val.length; i++) {
                    var iNum = val[i].substring(val[i].indexOf(ecode) + ecode.length, val[i].length).split('.')[0];
                    arr.push('<div class="mapbox text-center" data-ecode="' + ecode + (iNum) + '"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>' + l + '</div></div><div class="photo"><div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="' + val[i] + '"></div></div></div></div>');
                }
                arr.push('<div class="mapbox text-center" data-tit="' + l + '" data-ecode="' + ecode + '" data-enum="' + numVal + '"><div class="tablev"><div><img class="addpic" src="../../resources/images/icon_addpic_default@3x.png"></div></div></div></div>')
            } else {
                arr.push('<div class="mapbox text-center" data-ecode="' + ecode + "1" + '"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>' + l + '</div></div>');
                arr.push('<div class="photo"></div>');
                arr.push('</div></div>');
                arr.push('<div class="mapbox text-center" data-tit="' + l + '" data-ecode="' + ecode + '" data-enum="1"><div class="tablev"><div><img class="addpic" src="../../resources/images/icon_addpic_default@3x.png"></div></div></div></div>')
            }
            arr.push('</div></div>');
            return arr.join('');

        },
        otherE2: function (l, id) {
            var arr = [];
            arr.push('<div class="pd-t20" id="' + id + '"><div class="txt-left">');
            arr.push(l);
            arr.push('</div><div class="txt-right ml0 impor_dark"><div class="radio-s4 fbox wrap mt20"><div class="fbox cen icon-s1 on"><i></i><div class="ml1">社保卡/医保卡</div></div><div class="fbox cen icon-s1"><i></i><div class="ml1">户口本</div></div><div class="fbox cen icon-s1"><i></i><div class="ml1">驾驶证</div></div><div class="fbox cen icon-s1"><i></i><div class="ml1">工卡</div></div><div class="fbox cen icon-s1"><i></i><div class="ml1">银行储蓄卡</div></div></div></div><div class="pd-t20 fbox"><div class="flex1 mapbox text-center"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>现场合影照片</div></div><div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="http://img.redocn.com/sheying/20160613/taoshuxiaheying_6472839.jpg" alt=""></div></div></div><div class="flex1 mapbox text-center ml2"><div class="tablev"><div><img class="w08" src="../../resources/images/icon_picture_default@3x.png"><div>现场背景照片</div></div><div class="close-btn"><i class="close"></i></div><div class="info_img"><img src="http://img.redocn.com/sheying/20160613/taoshuxiaheying_6472839.jpg" alt=""></div></div></div></div></div>');
            return arr.join('');
        },
        btn: function (l, id, etype, styles, url) {
            var styles = !!styles ? eval('(' + styles + ')') : '';
            return '<div id="' + id + '" data-etype="' + etype + '"><div class="pd-tb-20"><div class="txt-left text-center"><a class="box-download" data-requesturl="' + url + '" href="javascript:;"' + (!!styles.postParam ? " data-postParam=" + JSON.stringify(styles.postParam) : "") + '>' + l + '</a></div></div></div>'
        }

    }
}
elParser.init()


//times
function a() {
    this.params = {
        minY: 1950,
        maxY: 2050,
        maxM: 12,
        maxD: 31
    };
    this.passY = this.params.maxY - this.params.minY + 1;
    this.yearMonthDay = function (a) {
        this.listener = a.target;
        this.gearDate = document.querySelector(".gearDate");
        if (!this.gearDate) {//如果不存在 就创建
            this.gearDate = document.createElement("div")
            this.gearDate.className = "gearDate";
            this.gearDate.innerHTML = '<div class="date_ctrl slideInUp"><div class="date_btn_box"><div class="date_btn">取消</div><div class="date_btn">确定</div></div><div class="date_roll_mask"><div class="date_roll"><div><div class="gear date_yy" data-datetype="date_yy" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)"></div><div class="date_grid"><div>年</div></div></div><div><div class="gear date_mm" data-datetype="date_mm" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid"><div>月</div></div></div><div><div class="gear date_dd" data-datetype="date_dd" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)"></div><div class="date_grid"><div>日</div></div></div></div></div></div>';
            document.body.appendChild(this.gearDate)
        }

        //赋值
        var a = new Date;
        var b = {yy: a.getYear(), mm: a.getMonth(), dd: a.getDate() - 1};
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(this.listener.value)) {
            rs = this.listener.value.match(/(^|-)\d{1,4}/g);
            b.yy = rs[0] - this.params.minY;
            b.mm = rs[1].replace(/-/g, "") - 1, b.dd = rs[2].replace(/-/g, "") - 1;
        } else {
            b.yy = b.yy + 1900 - this.params.minY;

        }
        this.gearDate.querySelector(".date_yy").setAttribute("val", b.yy);
        this.gearDate.querySelector(".date_mm").setAttribute("val", b.mm);
        this.gearDate.querySelector(".date_dd").setAttribute("val", b.dd);
        this.setDateGear()

        //弹出
        if (!this.gearDate.style.display || this.gearDate.style.display == 'none') {
            this.gearDate.style.display = "block";
        }
    }

    //设置数据
    this.setDateGear = function () {
        var a = times.gearDate.querySelector(".date_yy");
        var b = "";
        if (a && a.getAttribute("val")) {
            var c = parseInt(a.getAttribute("val"));
            for (d = 0; times.passY - 1 >= d; d++) {
                b += "<div class='tooth'>" + (times.params.minY + d) + "</div>";
            }
            a.innerHTML = b;
            var e = Math.floor(parseFloat(a.style.top));
            if (isNaN(e)) {
                a.style.top = 8 - 2 * c + "em";
            } else {
                e % 2 == 0 ? e = e : e += 1;
                e > 8 && (e = 8);
                var f = 8 - 2 * (times.passY - 1);
                f > e && (e = f), a.style.top = e + "em", c = Math.abs(e - 8) / 2, a.setAttribute("val", c)
            }
            var g = times.gearDate.querySelector(".date_mm");
            if (g && g.getAttribute("val")) {
                b = "";
                var h = parseInt(g.getAttribute("val"));
                var i = 12;//12个月
                if (times.params.maxY == times.params.minY + c) {
                    i = times.params.maxM;
                    var e = Math.floor(parseFloat(g.style.top));
                    if (isNaN(e))g.style.top = 8 - 2 * (i - 1) + "em"; else {
                        e % 2 == 0 ? e = e : e += 1, e > 8 && (e = 8);
                        var f = 8 - 2 * (i - 1);
                        f > e && (e = f), g.style.top = e + "em", h = Math.abs(e - 8) / 2, g.setAttribute("val", h)
                    }
                } else g.style.top = 8 - 2 * h + "em";
                for (var d = 0; i > d; d++) {
                    b += "<div class='tooth'>" + (1 + d) + "</div>";
                }
                g.innerHTML = b;
                var j = times.gearDate.querySelector(".date_dd");
                if (j && j.getAttribute("val")) {
                    b = "";
                    var k = parseInt(j.getAttribute("val"));
                    var l = times.calcDays(c, h);
                    var m = l;
                    if (times.params.maxY == times.params.minY + c && times.params.maxM == h + 1 && (m = times.params.maxD), l >= m) {
                        var e = Math.floor(parseFloat(j.style.top));
                        if (isNaN(e)) {
                            j.style.top = 8 - 2 * k + "em";
                        } else {
                            e % 2 == 0 ? e = e : e += 1, e > 8 && (e = 8);
                            var f = 8 - 2 * (m - 1);
                            f > e && (e = f);
                            j.style.top = e + "em";
                            k = Math.abs(e - 8) / 2;
                            j.setAttribute("val", k)
                        }
                    } else {
                        j.style.top = 8 - 2 * k + "em";
                    }
                    for (var d = 0; m > d; d++) {
                        b += "<div class='tooth'>" + (1 + d) + "</div>";
                    }
                    j.innerHTML = b
                }
            }
        }
    }

    //计算月份最大值
    this.calcDays = function (a, b) {
        if (1 == b) {
            a += times.params.minY;
            return a % 4 == 0 && a % 100 != 0 || a % 400 == 0 && a % 4e3 != 0 ? 29 : 28
        } else {
            return 3 == b || 5 == b || 8 == b || 10 == b ? 30 : 31
        }
    }

    //取消
    this.cancelDateEdit = function () {
        this.gearDate.style.display = "none"
    }

    this.cancelTimeEdit = function () {
        this.gearTime.style.display = "none"
    }

    //确定
    this.finishDateEdit = function () {
        var a = parseInt(times.gearDate.querySelector(".date_yy").getAttribute("val"));
        var b = parseInt(times.gearDate.querySelector(".date_mm").getAttribute("val"));
        b = b % 12 + 1;
        b = b > 9 ? b : "0" + b;
        var c = parseInt(times.gearDate.querySelector(".date_dd").getAttribute("val"));
        c = c % times.calcDays(a, b) + 1;
        c = c > 9 ? c : "0" + c;
        times.listener.value = a % times.passY + times.params.minY + "-" + b + "-" + c;
        this.cancelDateEdit()
    }
}
var times = new a();

function editDatetime(a) {
    if (times.listener = a.target, times.gearDate = document.querySelector(".gearDatetime"), times.gearDate || (times.gearDate = document.createElement("div"), times.gearDate.className = "gearDatetime", times.gearDate.innerHTML = '<div class="date_ctrl slideInUp"><div class="date_btn_box"><div class="date_btn" onclick="cancelDateEdit();">取消</div><div class="date_btn" onclick="finishDatetimeEdit();">确定</div></div><div class="date_roll_mask"><div class="datetime_roll"><div><div class="gear date_yy" data-datetype="date_yy" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>年</div></div></div><div><div class="gear date_mm" data-datetype="date_mm" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>月</div></div></div><div><div class="gear date_dd" data-datetype="date_dd" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>日</div></div></div><div><div class="gear time_hh" data-datetype="time_hh" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>时</div></div></div><div><div class="gear time_mm" data-datetype="time_mm" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>分</div></div></div></div></div></div>', document.body.appendChild(times.gearDate)), null != times.listener.getAttribute("data-hl-calendar")) {
        var b = times.listener.getAttribute("data-hl-calendar").split(","), c = b[0], d = c.split("-");
        times.params.minY = ~~d[0];
        var e = b[1], f = e.split("-");
        times.params.maxY = ~~f[0], times.passY = times.params.maxY - times.params.minY + 1, times.params.maxM = ~~f[1], times.params.maxD = ~~f[2]
    }
    dateTimeCtrlInit(times.gearDate), times.gearDate.style.display && "none" != times.gearDate.style.display || (times.gearDate.style.display = "block")
}
function dateTimeCtrlInit(a) {
    var b = new Date, c = {yy: b.getYear(), mm: b.getMonth(), dd: b.getDate() - 1, hh: b.getHours(), mi: b.getMinutes()};
    /^\d{4}-\d{1,2}-\d{1,2}\s\d{2}:\d{2}$/.test(times.listener.value) ? (rs = times.listener.value.match(/(^|-|\s|:)\d{1,4}/g), c.yy = rs[0] - times.params.minY, c.mm = rs[1].replace(/-/g, "") - 1, c.dd = rs[2].replace(/-/g, "") - 1, c.hh = parseInt(rs[3].replace(/\s0?/g, "")), c.mi = parseInt(rs[4].replace(/:0?/g, ""))) : c.yy = c.yy + 1900 - times.params.minY, a.querySelector(".date_yy").setAttribute("val", c.yy), a.querySelector(".date_mm").setAttribute("val", c.mm), a.querySelector(".date_dd").setAttribute("val", c.dd), times.setDateGear(), a.querySelector(".time_hh").setAttribute("val", c.hh), a.querySelector(".time_mm").setAttribute("val", c.mi), setTimeGear(a)
}
function finishDatetimeEdit() {
    times.gearDate.style.display = "none";
    var a = parseInt(times.gearDate.querySelector(".date_yy").getAttribute("val")), b = parseInt(times.gearDate.querySelector(".date_mm").getAttribute("val"));
    b = b % 12 + 1, b = b > 9 ? b : "0" + b;
    var c = parseInt(times.gearDate.querySelector(".date_dd").getAttribute("val"));
    c = c % times.calcDays(a, b) + 1, c = c > 9 ? c : "0" + c;
    var d = times.gearDate.querySelector(".time_hh").getAttribute("val"), e = times.gearDate.querySelector(".time_mm").getAttribute("val");
    times.listener.value = a % times.passY + times.params.minY + "-" + b + "-" + c + " " + (d.length < 2 ? "0" : "") + d + (e.length < 2 ? ":0" : ":") + e
}
function editTime(a) {
    times.listener = a.target, times.gearTime = document.querySelector(".gearTime"), times.gearTime || (times.gearTime = document.createElement("div"), times.gearTime.className = "gearTime", times.gearTime.innerHTML = '<div class="time_ctrl slideInUp"><div class="date_btn_box"><div class="date_btn" onclick="cancelTimeEdit();">取消</div><div class="date_btn" onclick="finishTimeEdit();">确定</div></div><div class="date_roll_mask"><div class="time_roll"><div><div class="gear time_hh" data-datetype="time_hh" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>时</div></div></div><div><div class="gear time_mm" data-datetype="time_mm" ontouchstart="gearTouchStart(event)" ontouchmove="gearTouchMove(event)" ontouchend="gearTouchEnd(event)" onmousewheel="gearScroll(event)"></div><div class="date_grid" onmousewheel="gearScroll(event)"><div>分</div></div></div></div></div></div>', document.body.appendChild(times.gearTime)), timeCtrlInit(times.gearTime), times.gearTime.style.display && "none" != times.gearTime.style.display || (times.gearTime.style.display = "block")
}
function timeCtrlInit(a) {
    var b = new Date, c = {hh: b.getHours(), mm: b.getMinutes()};
    /^\d{2}:\d{2}$/.test(times.listener.value) && (rs = times.listener.value.match(/(^|:)\d{2}/g), c.hh = parseInt(rs[0].replace(/^0?/g, "")), c.mm = parseInt(rs[1].replace(/:0?/g, ""))), a.querySelector(".time_hh").setAttribute("val", c.hh), a.querySelector(".time_mm").setAttribute("val", c.mm), setTimeGear(a)
}
function setTimeGear(a) {
    var b = a.querySelector(".time_hh");
    if (b && b.getAttribute("val")) {
        var c = "", d = parseInt(b.getAttribute("val"));
        b.style.top = 8 - 2 * d + "em";
        for (var e = 0; 23 >= e; e++)c += "<div class='tooth'>" + e + "</div>";
        b.innerHTML = c;
        var f = a.querySelector(".time_mm");
        if (f && f.getAttribute("val")) {
            var c = "", g = parseInt(f.getAttribute("val"));
            f.style.top = 8 - 2 * g + "em";
            for (var e = 0; 59 >= e; e++)c += "<div class='tooth'>" + e + "</div>";
            f.innerHTML = c
        }
    }
}
function finishTimeEdit() {
    times.gearTime.style.display = "none";
    var a = times.gearTime.querySelector(".time_hh").getAttribute("val"), b = times.gearTime.querySelector(".time_mm").getAttribute("val");
    times.listener.value = (a.length < 2 ? "0" : "") + a + (b.length < 2 ? ":0" : ":") + b
}


function gearTouchStart(a) {
    a.preventDefault();
    for (var b = a.target, c = this; ;) {
        if (b.classList.contains("gear"))break;
        b = b.parentElement
    }
    c["old_" + b.id] = a.targetTouches[0].screenY;
    c["o_t_" + b.id] = (new Date).getTime();
    if (b.style.top) {
        if (/em/.test(b.style.top)) {
            c["o_d_" + b.id] = parseFloat(b.style.top.replace(/em/g, ""))
        } else {
            if (/px/.test(b.style.top)) {
                c["o_d_" + b.id] = 18 * parseFloat(b.style.top.replace(/px/g, "")) / b.clientHeight
            } else {
                c["o_d_" + b.id] = 0
            }
        }
    } else {
        c["o_d_" + b.id] = 0
    }
}
function gearTouchMove(a) {
    a.preventDefault();
    for (var b = a.target, c = this; ;) {
        if (b.classList.contains("gear"))break;
        b = b.parentElement
    }
    c["new_" + b.id] = a.targetTouches[0].screenY;
    c["n_t_" + b.id] = (new Date).getTime();
    var d = 18 * (c["new_" + b.id] - c["old_" + b.id]) / 370;
    c["pos_" + b.id] = c["o_d_" + b.id] + d;
    b.style.top = c["pos_" + b.id] + "em";
}
function gearTouchEnd(a) {
    a.preventDefault();
    for (var b = a.target, c = this; ;) {
        if (b.classList.contains("gear"))break;
        b = b.parentElement
    }
    var d = (c["new_" + b.id] - c["old_" + b.id]) / (c["n_t_" + b.id] - c["o_t_" + b.id]);
    if (Math.abs(d) <= .2) {
        c["spd_" + b.id] = 0 > d ? -.08 : .08
    } else {
        if (Math.abs(d) <= .5) {
            c["spd_" + b.id] = 0 > d ? -.16 : .16
        } else {
            c["spd_" + b.id] = d / 2
        }
    }

    c["pos_" + b.id] || (c["pos_" + b.id] = 0);
    setGear(b, 1);

}
//设置val值
function setGear(a, b) {
    var c = parseFloat(a.getAttribute("val")) + b;
    switch (a.dataset.datetype) {
        case"date_yy":
            var d = Math.floor(parseFloat(a.style.top));
            d % 2 == 0 ? d = d : d += 1, d > 8 && (d = 8);
            var e = 8 - 2 * (times.passY - 1);
            e > d && (d = e), a.style.top = d + "em", c = Math.abs(d - 8) / 2;
            break;
        case"date_mm":
            var d = Math.floor(parseFloat(a.style.top));
            d % 2 == 0 ? d = d : d += 1, d > 8 && (d = 8);
            var e = -14;
            e > d && (d = e), a.style.top = d + "em", c = Math.abs(d - 8) / 2;
            break;
        case"date_dd":
            var f = times.gearDate.querySelector(".date_yy"), g = times.gearDate.querySelector(".date_mm"), h = parseInt(f.getAttribute("val")), i = parseInt(g.getAttribute("val")), j = times.calcDays(h, i), d = Math.floor(parseFloat(a.style.top));
            d % 2 == 0 ? d = d : d += 1, d > 8 && (d = 8);
            var e = 8 - 2 * (j - 1);
            e > d && (d = e), a.style.top = d + "em", c = Math.abs(d - 8) / 2;
            break;
        case"time_hh":
            var d = Math.floor(parseFloat(a.style.top));
            d % 2 == 0 ? d = d : d += 1, d > 8 && (d = 8), -38 > d && (d = -38), a.style.top = d + "em", c = Math.abs(d - 8) / 2;
            break;
        case"time_mm":
            var d = Math.floor(parseFloat(a.style.top));
            d % 2 == 0 ? d = d : d += 1, d > 8 && (d = 8), -110 > d && (d = -110), a.style.top = d + "em", c = Math.abs(d - 8) / 2
    }
    a.setAttribute("val", c);
    /date/.test(a.dataset.datetype) && times.setDateGear()
}


//身份证信息
function idCardInfo(str) {
    var gender, age;
    if (15 == str.length) {
        if (parseInt(str.charAt(14) / 2) * 2 != str.charAt(14))
            gender = '男';
        else
            gender = '女';
    } else if (18 == str.length) {
        if (parseInt(str.charAt(16) / 2) * 2 != str.charAt(16))
            gender = '男';
        else
            gender = '女';
    }
    //获取年龄
    var myDate = new Date();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var age = myDate.getFullYear() - str.substring(6, 10) - 1;
    if (str.substring(10, 12) < month || str.substring(10, 12) == month && str.substring(12, 14) <= day) {
        age++;
    }


    return {"gender": gender, "age": age};
}
console.log(idCardInfo("429005198702023974"))
