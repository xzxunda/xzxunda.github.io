/**
 * Created by JLee on 16/7/20.
 */

/*var test = window.location.href;
alert(test);*/
$.cookie('management', '', { expires: -1 }); // 删除 cookie

var secondCtrl = angular.module('login', ['ngRoute', 'httpService']);


secondCtrl.controller('loginCtrl', function ($scope, $location, httpService) {
    $scope.login = function () {
        var userName = $scope.username;
        var password = $scope.password;
        var params = {
            "username": userName,
            "password": password
        };
        var author_code = "Basic " + btoa(userName + ":" + password);

        /**
         * Created by sw on 2017-5-30 20:16:37
         * 判断pc还是移动端访问
         * true为pc；false为移动端
         */
        var ua = navigator.userAgent.toLocaleLowerCase();
        var pf = navigator.platform.toLocaleLowerCase();
        var isAndroid = (/android/i).test(ua)||((/iPhone|iPod|iPad/i).test(ua) && (/linux/i).test(pf))
            || (/ucweb.*linux/i.test(ua));
        var isIOS =(/iPhone|iPod|iPad/i).test(ua) && !isAndroid;
        var isWinPhone = (/Windows Phone|ZuneWP7/i).test(ua);

        var mobileType = {
            pc:!isAndroid && !isIOS && !isWinPhone,
            ios:isIOS,
            android:isAndroid,
            winPhone:isWinPhone
        };
        var pc_phone=mobileType.pc;

        $.ajax({
            url: API_URL + "/api/orgUsers",
            data: params,
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", author_code);
            },
            success: function (data) {

                for(var i=0;i<data.length;i++){
                    if(data[i].password==password&&data[i].userName==userName){
                        $.cookie('id',data[i].id)
                        $.cookie('management',data[i].management);
                        if(data[i].management=="1"){
                            if(pc_phone==false){
                                window.location.href = "/pages/phone/cartime.html";
                            }else{
                                window.location.href = "/pages/home.html";
                            }
                        }else{
                            window.location.href = "/pages/userHome.html";
                        }
                    }
                }
                $.cookie('userName',userName);
                $.cookie('passWord',password);
                $.cookie('islogin', 'true', {path: '/'});
                $.cookie('author_code', author_code, {path: '/'});
                /*alert($.cookie('id'))*/
            },
            error: function (err) {
                alert("登录失败！！")
                console.log(err.status);
            }
        });
        console.log("登录");

    }
});