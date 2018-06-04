/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//constants for paypal
app.constant('shopSettings', {

    // payPalSandboxId :'AZREwCWpm0zAvziz-Z_PLKiPAuUwLSxQnSWGl5jtY8WKdpMYmke9T57obejUba4Xu3_91FltVSKLHo8C',
    //    payPalSandboxId :'AZREwCWpm0zAvziz-Z_PLKiPAuUwLSxQnSWGl5jtY8WKdpMYmke9T57obejUba4Xu3_91FltVSKLHo8C',
    payPalSandboxId: 'payPalSandboxId',
    payPalProductionId: 'AREibK42Yc_tVBXnqUKAfk2qvAlf6tmHXDdsFhGFGf6j0dWxkDq1BX51yS65QZm_KTxO8U4A4CiRy1zg',

    //  payPalEnv: 'PayPalEnvironmentProduction', // PayPalEnvironmentSandbox for testing production for production for sand box : PayPalEnvironmentSandbox

    payPalEnv: 'PayPalEnvironmentProduction',

    payPalShopName: 'attendanceapp',

    payPalMerchantPrivacyPolicyURL: 'http://webapp.ws/wp-login.php',

    payPalMerchantUserAgreementURL: 'http://webapp.ws/wp-login.php'

});

// paypal code
app.factory('PaypalService', ['$q', '$ionicPlatform', 'shopSettings', '$filter', '$timeout', function ($q, $ionicPlatform, shopSettings, $filter, $timeout) {
    var init_defer;

    var service = {
        initPaymentUI: initPaymentUI,
        createPayment: createPayment,
        configuration: configuration,
        onPayPalMobileInit: onPayPalMobileInit,
        makePayment: makePayment
    };

    function initPaymentUI() {
        console.log("ui");
        init_defer = $q.defer();
        $ionicPlatform.ready().then(function () {
            var clientIDs = {
                "PayPalEnvironmentProduction": shopSettings.payPalProductionId,
                "PayPalEnvironmentSandbox": shopSettings.payPalSandboxId
            };
            console.log(clientIDs);
            console.log("another");
            console.log(onPayPalMobileInit);
            PayPalMobile.init(clientIDs, onPayPalMobileInit);
        });
        return init_defer.promise;
    }

    function createPayment(total, name) {
        // "Sale == > immediate payment
        // "Auth" for payment authorization only, to be captured separately at a later time.
        // "Order" for taking an order, with authorization and capture to be done separately at a later time.
        var payment = new PayPalPayment("" + total, "USD", "" + name, "Sale");
        return payment;
    }

    function configuration() {
        // for more options see `paypal-mobile-js-helper.js`
        var config = new PayPalConfiguration({ merchantName: shopSettings.payPalShopName, merchantPrivacyPolicyURL: shopSettings.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: shopSettings.payPalMerchantUserAgreementURL });
        return config;
    }

    function onPayPalMobileInit() {
        $ionicPlatform.ready().then(function () {
            // must be called
            // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
            PayPalMobile.prepareToRender(shopSettings.payPalEnv, configuration(), function () {
                $timeout(function () {
                    init_defer.resolve();
                });
            });
        });
    }

    function makePayment(total, name) {
        var defer = $q.defer();
        total = $filter('number')(total, 2);
        //alert(total);
        $ionicPlatform.ready().then(function () {
            PayPalMobile.renderSinglePaymentUI(createPayment(total, name), function (result) {
                $timeout(function () {
                    defer.resolve(result);
                });
            }, function (error) {
                $timeout(function () {
                    defer.reject(error);
                });
                alert(error);
            });
        });
        return defer.promise;
    }
    return service;
}]);


app.config(["$compileProvider", function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|content|file):/);

}]);



app.controller('login', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code', '$http', 'webservice', '$timeout',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code, $http, webservice, $timeout) {
        $scope.ads = {};
        //For Shownews controller
        $rootScope.data = { items: [] };
        $rootScope.newsalreadyloaded = false;
        $rootScope.newsdonotdoagain = false;
        //For Shownews controller
        $scope.lang = lang.getLang();
        $scope.title = $scope.lang.attendance;
        $rootScope.lang = lang.getLang();
        localFactory.setLocalItem("newscount", 0);
        $scope.options = [
            {
                name: 'Something Cool',
                value: ''
            },
            {
                name: 'Something Else',
                value: 'something-else-value'
            }
        ];


        // $scope.schname="Select School";
        $scope.buy = function () {
            $location.path("/plan");
        }
        $http.get(webservice.getService('getAds')).success(function (data) {
            $scope.ads = data.ads;
            $timeout(function () {
                $('.blueberry').blueberry();
            }, 1000);


        }).error(function (e) {
            console.log('Error', e);
        });
        $scope.logo = 'images/logo_' + lang_code + '.png';
        $scope.deviceId = localFactory.getLocalItem('device_id');
        $scope.osType = localFactory.getLocalItem('os_type');
        $scope.registration_id = localFactory.getLocalItem('push_id');
        //localFactory.toast($scope.registration_id);
        ////debugger;
        $scope.email_id = (localFactory.getLocalItem("email_id") !== undefined) ? localFactory.getLocalItem("email_id") : "subho@gmail.com";
        $scope.password = (localFactory.getLocalItem("password") !== undefined) ? localFactory.getLocalItem("password") : "123456";

        if (localFactory.getLocalItem("password") !== undefined || localFactory.getLocalItem("password") !== '') {
            $("#remme").attr("checked", 'checked');
        }

        $scope.resetPass = function () {
            localFactory.prompt($scope.lang.give_email, $scope.setPass, $scope.lang.email_addr, $scope.lang.passreset);
        };

        $scope.setPass = function (email) {
            if (email == '' || email == null) {
                localFactory.toast($scope.lang.email_cant_be_empty);
                return false;
            }
            localFactory.post('resetPass', {
                email_id: email
            }).success(function (data) {
                localFactory.toast(data.msg);
            }).error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };

        $scope.getschools = function () {
            //debugger;
            localFactory.load();
            var requestLogin = localFactory.post('getSchool', {});

            requestLogin.success(function (data) {
                console.log(data.schools);
                localFactory.unload();
                $scope.schoollist = data.schools;
                // if (data.success) {
                //     //debugger;
                //     localFactory.unload();
                //     $scope.schoollist = data;
                // } else {
                //     localFactory.unload(); // this isn't happening:
                //     localFactory.alert(data);
                // }

            });
            requestLogin.error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        }
        $scope.getschools();
        ////debugger;

        //var aan = localFactory.getLocalItem("school").id;
        //(localFactory.getLocalItem("school") !== undefined) ? localFactory.getLocalItem("school") : "123456";
        try {
            $scope.schname = (localFactory.getLocalItemJSON("school") !== undefined) ? localFactory.getLocalItemJSON("school") : "123456";
        }
        catch (e) {
            console.log(e.message);

            $scope.schname = "";
        }
        //    $scope.schname = $scope.options1[0];
        console.log("hello");
        console.log($scope.schname);

        if ($scope.schname == undefined || $scope.schname == "") {
            $scope.schname = $scope.options[0];
            $scope.schoollogo = "images/logo.png";
            $rootScope.schlogo = "images/logo.png";
        }
        else {
            $scope.schoollogo = "http://webapp.ws/s3d1/uploads/" + $scope.schname.pic;
            if ($scope.schname.pic == undefined || $scope.schname.pic == "") {
                $rootScope.schlogo = "images/logo.png";
                $scope.schoollogo = "images/logo.png";
            }
            else {
                $rootScope.schlogo = "http://webapp.ws/s3d1/uploads/" + $scope.schname.pic;
                $scope.schoollogo = "http://webapp.ws/s3d1/uploads/" + $scope.schname.pic;
            }
        }

        $scope.login = function () {
            //        alert( $scope.deviceId );
            //        alert( $scope.osType );
            console.log("selected school");
            console.log($scope.schname);
            if ($scope.schname.value == '' || $scope.email_id == '' || $scope.password == '' || $scope.email_id == null || $scope.password == null) {
                localFactory.alert($scope.lang.empty_not);
                return false;
            }
            $scope.pageClass = 'page-about';
            localFactory.load();
            var credential = {
                email_id: $scope.email_id,
                password: $scope.password,
                device_id: $scope.deviceId,
                os_type: $scope.osType,
                registration_id: $scope.registration_id,
                school_id: $scope.schname.id
            };

            var requestLogin = localFactory.post('login', credential);
            // //debugger;
            if ($("#remme").is(":checked")) {
                localFactory.setLocalItem("email_id", $scope.email_id, false);
                localFactory.setLocalItem("password", $scope.password, false);
                console.log("hello h1");
                console.log($scope.schname);
                if ($scope.schname.pic == undefined || $scope.schname.pic == "") {
                    $rootScope.schlogo = "images/logo.png";
                }
                else {
                    $rootScope.schlogo = "http://webapp.ws/s3d1/uploads/" + $scope.schname.pic;
                }
                var aar = $scope.schname;
                localFactory.setLocalItemJSON("school", aar, false);
                console.log(localFactory.getLocalItemJSON("school"));
                //localFactory.setLocalItem("schoolname", $scope.schname.school_name, false);
            } else {
                localFactory.setLocalItem("email_id", "");
                localFactory.setLocalItem("password", "");
                localFactory.setLocalItem("school", "");
                $rootScope.schlogo = "http://webapp.ws/s3d1/uploads/" + $scope.schname.pic;
                //localFactory.setLocalItem("schoolname", "");
            }
            requestLogin.success(function (data) {
                console.log(data);
                if (data.success) {
                    //debugger;
                    localFactory.setLocalItem("session_id", data.session_id, true);
                    localFactory.setLocalItem("user_type", data.details.user_type, true);
                    localFactory.setLocalItem("user_no", data.details.user_no, true);
                    store.addData('user', data.details);
                    $rootScope.user_name = data.details.first_name + " " + data.details.last_name;
                    $rootScope.isadmin = (store.getData('user').user_type === "1") ? true : false;
                    $rootScope.ismod = (store.getData('user').user_type === "3") ? true : false;
                    if (data.details.user_type == 4) {
                        localFactory.unload();
                        $location.path('children');
                        return false;
                        //                    alert('going');
                        //                    var child_id = data.details.child.sid;
                        //                    if(data.details.child){
                        //                        $scope.viewStudent(child_id);
                        //                        return false;
                        //                    }else{
                        //                        $location.path('user');
                        //                    }
                    }

                    localFactory.unload();
                    $scope.pageClass = 'page-about';
                    $location.path('classes');
                } else {
                    localFactory.unload(); // this isn't happening:
                    localFactory.alert(data.msg);
                }

            });
            requestLogin.error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        }
        $scope.viewStudent = function (sid) {
            //        if(!$scope.admin){
            ////            localFactory.toast("Sorry you cant do this.");
            //            return false;
            //        }
            localFactory.unload();
            var response = localFactory.post('viewStudent/' + sid, {
                user_no: store.getData('user').user_no,
                session_id: localFactory.getLocalItem('session_id'),
                cid: store.getData('course_id'),
            });
            response.success(function (data) {
                localFactory.unload();
                if (!data.session) {
                    localFactory.alert($scope.lang.session_expire, function () {
                        window.location.hash = '#/';
                        localFactory.flushLocalItems();
                        if (!$scope.$$phase)
                            $scope.$apply();
                        localFactory.toast($scope.lang.logged_out)
                    });
                } else {
                    store.addData('course', data.details.course);

                    store.addData('student', data.details);
                    $location.path('student');
                }
            });
            response.error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };

    }
]);
app.controller('classes', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code) {

        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.title = $scope.lang.class;
        $scope.edit = false;
        $scope.editText = $scope.lang.edit_text;
        $scope.admin = (store.getData('user').user_type === "1") ? true : false;
        console.log($scope.admin);
        $scope.clicked = false;
        $scope.editMode = function () {
            if ($scope.edit) {
                $scope.edit = false;
                $scope.editText = $scope.lang.edit_text;
                $scope.title = $scope.lang.class;
            } else {
                $scope.edit = true;
                $scope.editText = $scope.lang.cancel;
                $scope.title = $scope.lang.edit_classes;
            }
        };

        $scope.init = function () {
            localFactory.load();
            ////debugger;
            var aaa = store.getData('user');
            var bbb = store.getData('user').user_no;
            var ccc = localFactory.getLocalItem('session_id');
            // var requestCourse = localFactory.post('getCourses/' + store.getData('user').user_no, {
            //     user_no: store.getData('user').user_no,
            //     school_id: store.getData('user').school_id,
            //     session_id: localFactory.getLocalItem('session_id')
            // });
            var requestCourse = localFactory.post('getCourses/' + store.getData('user').school_id, {
                user_no: store.getData('user').user_no,
                school_id: store.getData('user').school_id,
                session_id: localFactory.getLocalItem('session_id')
            });
            requestCourse.success(function (courses) {

                if (!courses.session) {
                    localFactory.unload(); // this isn't happening:
                    localFactory.alert($scope.lang.session_expire, function () {
                        window.location.hash = '#/';
                        localFactory.flushLocalItems();
                        if (!$scope.$$phase)
                            $scope.$apply();
                        localFactory.toast($scope.la.logged_out)
                    });
                } else {

                    localFactory.unload();
                    $scope.courses = courses.courses;
                    console.log(courses.courses);
                    store.addData('courses', courses.courses);
                    $scope.desplayData = [];

                    for (var i = 0; i < courses.courses.length; i++) {
                        var objTemp = {
                            "row1": courses.courses[i]
                        };
                        if (courses.courses[i + 1]) {
                            objTemp["row2"] = courses.courses[i + 1]
                        };
                        if (courses.courses[i + 2]) {
                            objTemp["row3"] = courses.courses[i + 2]
                        };
                        $scope.desplayData.push(objTemp);
                        i = i + 2;
                    };

                    //  console.log($scope.desplayData);
                }
            });
        };
        $scope.init();
        $scope.addClass = function () {
            $location.path('addClass');
        };
        $scope.goBack = function () {
            if ((window.location) && (window.location.hash) && (window.location.hash == "#/classes")) {
                return localFactory.confirm($scope.lang.want_to_logout, $scope.goBackCallback);
                //            navigator.app.exitApp();   // This will exit the application
            }
        };
        $scope.goBackCallback = function (yes) {
            if (yes == 1) {
                localFactory.load();
                localFactory.post('logout', {
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id')
                }).success(function (data) {
                    if (data.success) {
                        //                                        localFactory.alert(data.msg);
                        window.location.hash = '#/';
                        // $scope.$apply();
                        localFactory.unload(); // this isn't happening:
                        localFactory.toast($scope.lang.logged_out);
                    } else {
                        localFactory.alert(data.msg);
                        localFactory.unload(); // this isn't happening:
                    }
                }).error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
                localFactory.flushLocalItems();
            } else {
                return false;
            }
        };
        $scope.loadCalender = function (course_id, desc, cname) {
            store.addData('course_id', course_id);
            localFactory.setLocalItem("clsnm", cname, true);
            if ($scope.edit) {
                localFactory.prompt($scope.lang.givecourse, $scope.goEdit, desc, $scope.lang.edit_text);
            } else {
                localFactory.load();
                console.log("Hello user");
                console.log(store.getData('user'));
                localFactory.post('getHolidays' + '/' + store.getData('user').school_id, {
                    user_no: store.getData('user').user_no,
                    school_id: store.getData('user').school_id,
                    session_id: localFactory.getLocalItem('session_id')
                }).success(function (data) {
                    localFactory.unload();
                    store.addData('holidays', data.holiday_string);
                    $location.path('callenderView');
                });

            }
        };
        $scope.loadCalenderdelay = function (course_id, desc, cname) {
            store.addData('course_id', course_id);
            //John's code
            localFactory.load();
            //--//
            localFactory.setLocalItem("clsnm", cname, true);
            $location.path('attendancedelay');
            // if ($scope.edit) {
            //     localFactory.prompt($scope.lang.givecourse, $scope.goEdit, desc, $scope.lang.edit_text);
            // } else {
            //     localFactory.load();
            //     console.log("Hello user");
            //     console.log(store.getData('user'));
            //     localFactory.post('getHolidays'+'/'+store.getData('user').school_id, {
            //         user_no: store.getData('user').user_no,
            //         school_id:store.getData('user').school_id,
            //         session_id: localFactory.getLocalItem('session_id')
            //     }).success(function(data) {
            //         localFactory.unload();
            //         store.addData('holidays', data.holiday_string);
            //         $location.path('callenderView');
            //     });

            // }
        };
        $scope.goEdit = function (desc) {
            localFactory.load()
            localFactory.post('manageCourse', {
                course: {
                    desc: desc
                },
                user_no: store.getData('user').user_no,
                session_id: localFactory.getLocalItem('session_id'),
                cid: store.getData('course_id')
            }).success(function (data) {
                localFactory.unload();
                if (!data.session) {
                    localFactory.alert($scope.lang.session_expire, function () {
                        window.location.hash = '#/';
                        localFactory.flushLocalItems();
                        if (!$scope.$$phase)
                            $scope.$apply();
                        localFactory.toast($scope.lang.logged_out)
                    });
                } else {
                    localFactory.alert(data.msg);
                    for (var i = 0; i < $scope.courses.length; i++) {
                        if ($scope.courses[i].cid == store.getData('course_id')) {
                            $scope.courses[i].desc = desc;
                        }
                    }
                }
                // this isn't happening:
            }).error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };

        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };

        //$rootScope.schlogo = "images/logo.png";

        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //  $location.path('#/');
        }

    }
]);
app.controller('addClasses', ['$scope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $location, localFactory, store, lang, lang_code) {
        $scope.lang = lang.getLang();
        $scope.course = {};
        $scope.course.name = "";
        $scope.course.desc = "";
        $scope.course.semno = "";
        $scope.registerClass = function () {
            localFactory.load();
            localFactory.post('manageCourse', {
                user_no: store.getData('user').user_no,
                session_id: localFactory.getLocalItem('session_id'),
                course: $scope.course
            }).success(function (data) {
                localFactory.unload();
                if (!data.session) {
                    localFactory.alert('The session has expired.', function () {
                        window.location.hash = '#/';
                        localFactory.flushLocalItems();
                        if (!$scope.$$phase)
                            $scope.$apply();
                        localFactory.toast('You have been logged out.')
                    });
                } else {
                    localFactory.alert(data.msg);
                    $location.path('classes');
                }
            }).error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };
    }
]);
app.directive('onScrollToBottom', function ($document, $window) {
    //This function will fire an event when the container/document is scrolled to the bottom of the page
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var doc = angular.element($document)[0].body;

            // element.on('scroll', function(){
            //     scope.$apply(attrs.onScrollToBottom);
            //   //  alert('Scroll has been detected.');
            //     console.log(element);
            //  })

            // var windowHeight = $window.innerHeight;
            // //var body = $document.body, html = $document.documentElement;
            // var body = doc, html = $document.documentElement;
            // var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
            // windowBottom = windowHeight + $window.pageYOffset;
            // if (windowBottom >= docHeight) {
            //     alert('bottom reached');
            // }

            angular.element($window).bind("scroll", function (e) {
                //    console.log(this.pageYOffset);
                //    console.log(this.innerHeight);
                //    console.log(doc.scrollHeight);
                if ((this.pageYOffset + this.innerHeight) == doc.scrollHeight) {
                    console.log("call new function");
                }
                if (this.pageYOffset == 0) {
                    // alert('The Page is at Scroll Top');
                    scope.$apply(attrs.onScrollToBottom);
                }
                scope.$apply();
            });

        }
    };
});

app.directive('onScrollToBottomLoadMore', function ($document, $window) {
    //This function will fire an event when the container/document is scrolled to the bottom of the page
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var doc = angular.element($document)[0].body;
            angular.element($window).bind("scroll", function (e) {
                console.log(this.pageYOffset);
                console.log(this.innerHeight);
                console.log(doc.scrollHeight);
                if ((this.pageYOffset + this.innerHeight) == doc.scrollHeight) {
                    // console.log("call new function");
                    scope.$apply(attrs.onScrollToBottomLoadMore);
                }
                // if(this.pageYOffset==0){
                //    // alert('The Page is at Scroll Top');
                //    scope.$apply(attrs.onScrollToBottomLoadMore);
                // }
                scope.$apply();
            });

        }
    };
});


app.controller('showNews', ['$scope', '$location', 'localFactory', 'store', 'lang', 'lang_code', '$rootScope', 'resultsFactory', '$timeout', '$q',
    function ($scope, $location, localFactory, store, lang, lang_code, $rootScope, resultsFactory, $timeout, $q) {

        $scope.lang = lang.getLang();
        $scope.course = {};
        $scope.course.name = "";
        $scope.course.desc = "";
        $scope.course.semno = "";
        $scope.news = "";
        $scope.popupflag = false;
        $scope.aboutus = false;
        $scope.newstap = true;
        $scope.newslengthforcompare = 0;
        $rootScope.timerintervel = 10;
        var pagecount = -1;

        $scope.date = new Date();

        // $ionicHistory.clearCache();
        // $ionicHistory.clearHistory();  
        var resultsFactory1 = {};
        function _all() {
            var d = $q.defer();
            $timeout(function () {
                d.resolve([{ txt: 'one' }, { txt: 'two' }, { txt: 'three' }]);
            }, 2000);

            return d.promise;
        }

        resultsFactory1.all = _all;
        $scope.navigate = function () {
            if ($scope.popupflag) {
                $scope.popupflag = false;
            }
            else {
                $location.path("/login");
            }
        }

        // $scope.results = [{txt: 'Loading..'}];
        // resultsFactory1.all().then(
        //   function(res){
        //     $scope.results = res;
        //   },
        //   function(err){
        //     console.error(err);
        //   }
        // );

        // $scope.callaboutus = function()
        // {
        //     $scope.aboutus = true;
        //     $scope.newstap = false;
        // }
        // $scope.callnews = function()
        // {
        //     $scope.aboutus = false;
        //     $scope.newstap = true;
        // }

        $scope.popup = function (url) {
            $rootScope.imgpopup = url;
            //$location.path("/showimagefull");
            $scope.popupflag = true;

        }

        // $scope.loadmore = function () {           

        //      console.log("Loading more");
        //      localFactory.load();
        //      $scope.getnews();
        //      localFactory.unload();
        //  }
        // $scope.test = function () {

        //    $scope.newslengthforcompare=0;
        //     $scope.getnews();

        // }
        // $scope.onInfinite = function() {
        //     //$timeout(fetchItems, 2000);
        //     $scope.data.items.push({ title: 'Item ' });
        //   };
        //   var fetchItems = function() {
        //     $scope.data.items.push({
        //       title: 'Item ' + $scope.data.items.length
        //     });
        //     $scope.$broadcast('scroll.infiniteScrollComplete');
        //   };

        $scope.loadMore = function () {
            alert('Hello');
        }
        $scope.login = function () {
            $location.path("/login");
        }
        $scope.newslength = function () {
            localFactory.post('getNews', {}).success(function (data) {
                localFactory.unload();
                ////debugger;
                //console.log(data);
                $scope.newslengthforcompare = data.length;
                $scope.getnews();

            }).error(function (data, status, headers, config) {
                //debugger;
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        }
        //localFactory.setLocalItem("newscount", 0);
        $scope.getnews = function () {

            // localFactory.load();
            // //debugger;
            pagecount++;
            var dataonpage = 0; // old value 10 //pass 0 for all record 
            var sortorder = "asc";
            // console.log($scope.data.items);
            //Server API using 1st page number from 0 , so here need to calculate pagecount +1 otherwith , If server will take page no from 1 then no need of +1 with pagenumber
            // if( pagecount == 0 || ((pagecount+1) * dataonpage) <= $scope.newslengthforcompare )
            // {
            // console.log('page '+pagecount);
            //newsGetjoin($school_id)
            //localFactory.post('getNews', {}).success(function(data) {
            //     // localFactory.setLocalItem("allnews", "");
            //     // localFactory.setLocalItem("newscount", "0");
            var alln = localFactory.getLocalItem("newscount");
            //localFactory.getLocalItem("allnews");    
            if (alln == undefined || alln == null || alln == "" || alln === "0" || alln == 0) {
                localFactory.setLocalItem("newscount", $scope.newslengthforcompare, false);
            }
            // else{
            //     var data = localFactory.getLocalItem("allnews");
            //     for(var i = 0; i < data.length; i++) {
            //         $scope.data.items.push({ ago: data[i]['ago'],school_name:data[i]['school_name'],school_logo:data[i]['school_logo'],detail:data[i]['detail'],content:data[i]['content'],news_image:data[i]['news_image'] });
            //       }
            // }
            // if(alln == $scope.newslengthforcompare){}
            // else
            {
                localFactory.get('getNewsjoin' + '/' + pagecount + "/" + dataonpage + "/" + sortorder, {}).success(function (data) {
                    // localFactory.unload();                
                    console.log(data);
                    $rootScope.newobj = data;
                    $rootScope.itemlength = data.length;
                    $rootScope.CurrentCount = data.length - 1;
                    // //debugger;
                    // localFactory.setLocalItem("allnews", data, false);
                    // var aaaa={items:[]} ;
                    // aaaa.items = localFactory.getLocalItem("allnews");
                    // console.log(aaaa);

                    // if(pagecount>1)
                    // {
                    //     $scope.news.push(data);
                    // }
                    // else{
                    //     $scope.news = data;
                    // }
                    if (!$rootScope.newsdonotdoagain) {
                        for (var i = 0; i < data.length; i++) {
                            $rootScope.data.items.unshift({ newsid: data[i]['news_id'], ago: data[i]['ago'], school_name: data[i]['school_name'], school_logo: data[i]['school_logo'], detail: data[i]['detail'], content: data[i]['content'], news_image: data[i]['news_image'] });
                        }
                        $rootScope.newsdonotdoagain = true;
                    }
                    $scope.CallCounter();
                    console.log(data.length);
                    //console.log($scope.news);
                    //  localFactory.alert(data[0].title);
                    // $location.path('classes');

                }).error(function (data, status, headers, config) {
                    //debugger;
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            }
            // }
            // else{
            //     console.log("No data");
            //     localFactory.unload();
            // }
        };

        $scope.loadnews = function () {
            // //debugger;
            if (!$rootScope.newsalreadyloaded) {
                $rootScope.newsalreadyloaded = true;
                $scope.getnews();

            }
            else {
                $scope.CallCounter();
            }
        }


        $scope.CallCounter = function () {
            $timeout(function () {
                // $scope.CurrentCount = $rootScope.itemlength - 1;
                //console.log($scope.CurrentCount)
                // if($scope.CurrentCount != $rootScope.itemlength){
                if ($rootScope.CurrentCount != 0) {
                    console.log($rootScope.CurrentCount);
                    if ($rootScope.data.items.find(item => { return item.newsid == $rootScope.newobj[$rootScope.CurrentCount]['news_id'] })) {
                        console.log("Found");
                        $rootScope.timerintervel = 2000;
                    }
                    else {
                        console.log("not found");
                        $rootScope.data.items.unshift({ newsid: $rootScope.newobj[$rootScope.CurrentCount]['news_id'], ago: $rootScope.newobj[$rootScope.CurrentCount]['ago'], school_name: $rootScope.newobj[$rootScope.CurrentCount]['school_name'], school_logo: $rootScope.newobj[$rootScope.CurrentCount]['school_logo'], detail: $rootScope.newobj[$rootScope.CurrentCount]['detail'], content: $rootScope.newobj[$rootScope.CurrentCount]['content'], news_image: $rootScope.newobj[$rootScope.CurrentCount]['news_image'] });
                        console.log($rootScope.data.items);
                    }


                    $rootScope.CurrentCount = $rootScope.CurrentCount - 1;

                    $scope.CallCounter();
                }
                else {

                    $scope.CurrentCount = $rootScope.itemlength - 1;
                    $scope.getnews();
                }
            }, $rootScope.timerintervel);
        }


        // $scope.newslength();

    }
]);
app.controller('FullscreenImageCtrl', ['$scope', '$ionicModal',
    function ($scope, $ionicModal) {

        $ionicModal.fromTemplateUrl('image-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function () {
            $scope.modal.show();
        };

        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hide', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });
        $scope.$on('modal.shown', function () {
            console.log('Modal is shown!');
        });

        $scope.imageSrc = 'https://ionicframework.com/img/ionic-logo-blog.png';

        $scope.showImage = function (index) {
            switch (index) {
                case 1:
                    $scope.imageSrc = 'https://ionicframework.com/img/ionic-logo-blog.png';
                    break;
                case 2:
                    $scope.imageSrc = 'https://ionicframework.com/img/ionic_logo.svg';
                    break;
                case 3:
                    $scope.imageSrc = 'https://ionicframework.com/img/homepage/phones-weather-demo@2x.png';
                    break;
            }
            $scope.openModal();
        }
    }
]);

app.controller('showAboutus', ['$scope', '$location', 'localFactory', 'store', 'lang', 'lang_code', '$ionicHistory', '$window',
    function ($scope, $location, localFactory, store, lang, lang_code, $ionicHistory, $window) {
        $scope.lang = lang.getLang();
        $scope.course = {};
        $scope.course.name = "";
        $scope.course.desc = "";
        $scope.course.semno = "";
        $scope.news = "";
        var pagecount = 0;
        $scope.login = function () {
            $location.path("/login");
        }
        $scope.callaboutus = function () {
            //debugger;
            $ionicHistory.goBack();
            // window.history.go(-1);
        }
        $scope.getnews = function () {

            localFactory.load();

            localFactory.post('getNews', {}).success(function (data) {
                localFactory.unload();

                console.log(data);
                $scope.news = data;
                console.log(data.length);
                //console.log($scope.news);
                //  localFactory.alert(data[0].title);
                // $location.path('classes');

            }).error(function (data, status, headers, config) {
                //debugger;
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };
    }
]);
app.controller('showPlans', ['$scope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $location, localFactory, store, lang, lang_code) {
        $scope.lang = lang.getLang();

        $scope.course = {};
        $scope.course.name = "";
        $scope.course.desc = "";
        $scope.course.semno = "";
        $scope.news = "";
        $scope.rad = "";
        $scope.selectplan = function (a) {
            if (a[0] === undefined) {
                alert("Please select plan.");
                localFactory.setLocalItem("plan_id", "");
            }
            else {
                localFactory.setLocalItem("plan_id", a[0], false);

            }
        }

        $scope.register = function (price, plandetail) {

            // console.log(localFactory.getLocalItem("plan_id"));
            localFactory.setLocalItem("plan_id", plandetail, false);
            localFactory.setLocalItem("plan_price", price, false);
            console.log(localFactory.getLocalItem("plan_price"));
            //  $location.path("/register");
            $location.path("/registernew");
        }
        $scope.login = function () {
            $location.path("/login");
        }
        $scope.getnews = function () {

            localFactory.load();
            localFactory.post('getplan', {}).success(function (data) {
                localFactory.unload();
                //debugger;
                console.log(data);
                $scope.news = data.plans;
                console.log(data.plans);
                console.log(data.plans.length);
                $scope.plansall = data.plans;
                //console.log($scope.news);
                //  localFactory.alert(data[0].title);
                // $location.path('classes');

            }).error(function (data, status, headers, config) {

                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };
        $scope.getnews();
    }
]);
app.controller('contactCtrl', ['$scope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $location, localFactory, store, lang, lang_code) {
        $scope.lang = lang.getLang();

        $scope.course = {};
        $scope.course.name = "";
        $scope.course.desc = "";
        $scope.course.semno = "";
        $scope.news = "";
        $scope.rad = "";
        $scope.f1 = "";
        $scope.f2 = "";
        $scope.f3 = "";
        $scope.f4 = "";


        $scope.sendcontact = function () {

            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var sdsd = re.test($scope.f2);
            var validate = false;
            $scope.emailv = false;
            $scope.msgv = false;
            if (sdsd) {
                validate = true;
            }
            else {
                $scope.emailv = true;
                validate = false;
            }
            if ($scope.f4) {
                validate = true;
            }
            else {
                $scope.msgv = true;
                validate = false;
            }
            if (validate) {
                localFactory.load();


                localFactory.post('sendcontact', { 'f1': $scope.f1, 'f2': $scope.f2, 'f3': $scope.f3, 'f4': $scope.f4 }).success(function (data) {
                    localFactory.unload();
                    console.log(data);
                }).error(function (data, status, headers, config) {

                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            }

        };
    }
]);
app.controller('registerwithbuy',
    function ($scope, $location, localFactory, store, lang, lang_code, $sce, $http, PaypalService) {
        $scope.lang = lang.getLang();
        $scope.course = {};
        $scope.course.name = "";
        $scope.course.desc = "";
        $scope.course.semno = "";
        $scope.news = "";
        $scope.schoolname = ""; $scope.address = ""; $scope.emailid = ""; $scope.password = ""; $scope.confirmpassword = "";
        $scope.contact = "";
        $scope.planid = localFactory.getLocalItem("plan_id");
        $scope.plandetail = localFactory.getLocalItem("plan_id");
        $scope.planprice = localFactory.getLocalItem("plan_price");
        var amt = $scope.planprice;
        //$scope,$ionicNavBarDelegate,$window, $stateParams,$ionicHistory,$sce,$http,PaypalService
        console.log(localFactory.getLocalItem("plan_price"));
        $scope.formvalid = false;
        $scope.validemail = false;
        $scope.validschoolname = false;
        $scope.validschooladdress = false;
        $scope.validpassword = false;
        $scope.validconfirmpassword = false;
        $scope.validsamepassword = false;


        $scope.chkemail = function (email) {
            //console.log('email chk');    

            if (!validateEmail(email)) {
                $scope.validemail = true;
            }
            else {
                $scope.validemail = false;

            }

        }
        $scope.chkschooldetail = function () {
            //console.log('email chk');    

            if ($scope.schoolname == undefined || $scope.schoolname == "") {
                $scope.formvalid = false;
                $scope.validschoolname = true;

            }
            else {
                $scope.formvalid = true;
                $scope.validschoolname = false;
            } if ($scope.address == undefined || $scope.address == "") {
                $scope.formvalid = false;
                $scope.validschooladdress = true;
            }
            else {
                $scope.formvalid = true;
                $scope.validschooladdress = false;
            }
            if ($scope.emailid == undefined || $scope.emailid == "") {
                $scope.validemail = true;
                $scope.formvalid = false;
            }
            else {
                $scope.formvalid = true;
                $scope.validemail = false;
                $scope.chkemail($scope.emailid);
            }
            if ($scope.password == undefined || $scope.password == "") {
                $scope.validpassword = true;
                $scope.formvalid = false;
            }
            else {
                $scope.validpassword = false;
                $scope.formvalid = true;

            }
            if ($scope.confirmpassword == undefined || $scope.confirmpassword == "") {
                $scope.validconfirmpassword = true;
                $scope.formvalid = false;
            }
            else {
                $scope.validconfirmpassword = false;
                $scope.formvalid = true;
            }
            if ($scope.formvalid == true && $scope.password === $scope.confirmpassword) {
                $scope.formvalid = true;
                $scope.validsamepassword = false;
            }
            else {
                $scope.formvalid = false;
                $scope.validsamepassword = true;
            }

        }
        var validateEmail = function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        $scope.paynow = function () {
            // $ionicHistory.clearCache();
            // $ionicHistory.clearHistory();       
            // console.log($scope.rad.undefined);

            $scope.chkschooldetail();
            //debugger;
            if ($scope.formvalid == true && $scope.validemail == false) {
                // $http.post("http://webapp.ws/example.php", {'price':amt})
                // .success(function(data,status,headers,config){
                //https://free.currencyconverterapi.com/api/v5/convert?q=USD_KWD&compact=y  
                $http.get("https://free.currencyconverterapi.com/api/v5/convert?q=KWD_USD&compact=y", {})
                    .success(function (data, status, headers, config) {
                        //debugger;
                        $scope.result = angular.fromJson(data);
                        var obj = angular.fromJson(data);
                        // for(var i=0;i< obj.USD_KWD.length ;i++)
                        for (var i = 0; i < 1; i++) {
                            // alert(data.stuff[i].id);
                            console.log(data.KWD_USD.val);
                            amt = data.KWD_USD.val * amt;
                            console.log(amt);
                            var factor = Math.pow(10, 2);
                            amt = Math.round(amt * factor) / factor;
                            console.log(amt);
                            //amt = data.stuff[i].id;
                            // amt = 100;
                            console.log(amt);

                            PaypalService.initPaymentUI().then(function () {
                                PaypalService.makePayment(amt, "Total Amount”").then(function (response) {
                                    // alert("success"+JSON.stringify(response));
                                    localFactory.load();
                                    console.log($scope.rad);
                                    localFactory.post('plan_subscribe', { 'plan_id': $scope.planid, 'school_name': $scope.schoolname, 'detail': $scope.address, 'user_id': $scope.emailid, 'password': $scope.password, 'email_id': $scope.emailid, 'paypal_trans_id': $scope.planid, 'status': 'success', 'contact': $scope.contact, 'duration': $scope.rad.undefined }).success(function (data) {
                                        localFactory.unload();
                                        console.log(data);
                                    }).error(function (data, status, headers, config) {

                                        localFactory.unload(); // this isn't happening:
                                        console.log("error", status);
                                    });
                                }, function (error) {
                                    alert("تم إلغاء التحويل");
                                    $location.path("/newplan");
                                });

                            }, function (error) {
                                console.log(error);
                            });
                        }
                    }).error(function (data, status, headers, config) {

                        // localFactory.unload(); // this isn't happening:
                        alert("خطأ في تحويل العملة");
                        console.log("error", status);
                    });
            }
            // else{
            //     alert("Please fill all fields");
            // }

        }

        $scope.login = function () {
            $location.path("/login");
        }
        $scope.back = function () {
            $location.path("/plan");
        }
        $scope.getnews = function () {

            localFactory.load();
            localFactory.post('getNews', {}).success(function (data) {
                localFactory.unload();

                console.log(data);
                $scope.news = data;
                console.log(data.length);
                //console.log($scope.news);
                //  localFactory.alert(data[0].title);
                // $location.path('classes');

            }).error(function (data, status, headers, config) {

                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };
    }
);
app.controller('mailCompose', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code) {
        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.x = "";
        $scope.mail = {};
        $scope.user = angular.copy(store.getData('user'));
        $scope.reset = function () {
            $scope.mail = {};
        };
        $scope.moda = ($scope.user.user_type == 3) ? true : false;
        $scope.admin = ($scope.user.user_type == 1) ? true : false;
        $scope.closeMail = function () {
            window.history.back();
        };
        $scope.sendMessage = function () {
            if (!$scope.mail.send_to) {
                localFactory.alert($scope.lang.select_user);
                return false;
            }
            if (!$scope.mail.title) {
                localFactory.alert($scope.lang.noti_title);
                return false;
            }
            if (!$scope.mail.notification) {
                localFactory.alert($scope.lang.noti_text);
                return false;
            }
            //debugger;
            $scope.x = $scope.mail.one_user_email;
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var sdsd = re.test($scope.x);
            if ($scope.mail.send_to.oneuser && !sdsd) {

                localFactory.load();
                var credential = {
                    email_id: $scope.email_id,
                    password: $scope.password,
                    device_id: $scope.deviceId,
                    os_type: $scope.osType,
                    registration_id: $scope.registration_id
                };
                var emailvalidate = 0;
                //new code
                console.log($scope.mail.one_user_email);
                var requestLogin = localFactory.post('exist_usern/' + $scope.mail.one_user_email, credential);


                requestLogin.success(function (data) {
                    console.log(data);
                    if (data.success) {
                        //localFactory.alert("success"+emailvalidate);
                        emailvalidate = 1;
                        $rootScope.user_name = data.user.first_name + " " + data.user.last_name;
                        $scope.mail.one_user_email = data.user.email_id;

                        if ($scope.mail.one_user_email == null || $scope.mail.one_user_email == undefined || $scope.mail.one_user_email == "") {
                            emailvalidate = 0;
                            console.log(emailvalidate);

                            //localFactory.alert("Invalid Username/UserId/emailId");
                        }

                        console.log("out ");
                        if (emailvalidate === 1) {
                            console.log(emailvalidate);

                            var uu = store.getData('user').user_no;
                            var vv = localFactory.getLocalItem('session_id');
                            var ww = $scope.mail;
                            localFactory.post('sendMessage', {
                                user_no: store.getData('user').user_no,
                                session_id: localFactory.getLocalItem('session_id'),
                                notification: $scope.mail
                            }).success(function (data) {
                                localFactory.unload();
                                $scope.reset();
                                localFactory.toast(data.msg)
                            }).error(function (data, status, headers, config) {
                                //debugger;
                                localFactory.unload(); // this isn't happening:
                                localFactory.toast($scope.lang.some_error)
                                console.log("error", status);
                            });
                        }
                        else {

                            var mm = 0;
                            if ($scope.mail.send_to.oneuser && !$scope.mail.one_user_email) {
                                mm = 1;
                                if (emailvalidate === 0) {
                                    localFactory.unload();
                                    localFactory.alert("Invalid Username/UserId/emailId");

                                }
                                else {

                                    var uu = store.getData('user').user_no;
                                    var vv = localFactory.getLocalItem('session_id');
                                    var ww = $scope.mail;
                                    localFactory.post('sendMessage', {
                                        user_no: store.getData('user').user_no,
                                        session_id: localFactory.getLocalItem('session_id'),
                                        notification: $scope.mail
                                    }).success(function (data) {
                                        localFactory.unload();
                                        $scope.reset();
                                        localFactory.toast(data.msg)
                                    }).error(function (data, status, headers, config) {
                                        //debugger;
                                        localFactory.unload(); // this isn't happening:
                                        localFactory.toast($scope.lang.some_error)
                                        console.log("error", status);
                                    });
                                }
                                //localFactory.alert($scope.lang.valid_email);
                                //return false;



                            }

                            if (mm == 0) {
                                //debugger;
                                var uu = store.getData('user').user_no;
                                var vv = localFactory.getLocalItem('session_id');
                                var ww = $scope.mail;
                                localFactory.post('sendMessage', {
                                    user_no: store.getData('user').user_no,
                                    session_id: localFactory.getLocalItem('session_id'),
                                    notification: $scope.mail
                                }).success(function (data) {
                                    localFactory.unload();
                                    $scope.reset();
                                    localFactory.toast(data.msg)
                                }).error(function (data, status, headers, config) {
                                    //debugger;
                                    localFactory.unload(); // this isn't happening:
                                    localFactory.toast($scope.lang.some_error)
                                    console.log("error", status);
                                });
                            }

                        }
                        // console.log($scope.mail.send_to.oneuser);
                        // console.log($scope.mail.one_user_email);
                        // // localFactory.unload();
                        //return true;
                    } else {
                        // localFactory.alert(data.msg);
                        localFactory.unload();
                        localFactory.alert("Invalid Username/UserId");
                        // localFactory.unload(); // this isn't happening:
                        // return false;
                    }
                });
                //  end of new code 
            }
            else {


                var uu = store.getData('user').user_no;
                var vv = localFactory.getLocalItem('session_id');
                var ww = $scope.mail;
                localFactory.post('sendMessage' + "/" + store.getData('user').school_id, {
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id'),
                    notification: $scope.mail
                }).success(function (data) {
                    localFactory.unload();
                    $scope.reset();
                    localFactory.toast(data.msg)
                }).error(function (data, status, headers, config) {
                    //debugger;
                    localFactory.unload(); // this isn't happening:
                    localFactory.toast($scope.lang.some_error)
                    console.log("error", status);
                });
            }


            // localFactory.load();

        };
        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };
        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            // $location.path('#/');
        }
    }
]);
app.controller('mailList', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code', '$parse',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code, $parse) {
        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.user = angular.copy(store.getData('user'));
        console.log($scope.user);
        if ($scope.user) {
            $rootScope.mailList = true;
        };
        if ($scope.user.user_type == 4) {
            $scope.user_parent = true;
        }
        localFactory.load();
        localFactory.post('getNotifications' + "/" + store.getData('user').school_id, {
            user_no: store.getData('user').user_no,
            session_id: localFactory.getLocalItem('session_id')
        }).success(function (data) {
            localFactory.unload();
            $scope.notifications = data.list;
        }).error(function (error) {
            localFactory.unload();
            alert('error');
            console.log(error);
        });
        $scope.deleteMessage = function (id, $event, $index) {
            $event.stopPropagation();
            localFactory.confirm($scope.lang.delete_noti, function (y) {
                if (y == 1) {
                    localFactory.load();
                    localFactory.post('deleteNotifications', {
                        user_no: store.getData('user').user_no,
                        nid: id,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        localFactory.unload();
                        $scope.notifications.splice($index, 1);
                        localFactory.toast(data.msg);
                    }).error(function (e) {
                        localFactory.unload();
                        console.log('Error', e);
                    });
                }
            });
        };

        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };
        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //  $location.path('#/');
        }
    }
]);
app.controller('attendanceController', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code', '$timeout',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code, $timeout) {
        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.lastEdited = {};
        $scope.clsnm = localFactory.getLocalItem('clsnm');
        // $scope.admin = (store.getData('user').user_type === "1" || store.getData('user').user_type === "3") ? true : false;
        $scope.admin = (store.getData('user').user_type === "1") ? true : false;
        $scope.mod = (store.getData('user').user_type === "3") ? true : false;
        $scope.teacher = (store.getData('user').user_type === "2") ? true : false;
        $scope.parent = (store.getData('user').user_type === "4") ? true : false;
        $scope.date = store.getData('date');
        $scope.students = store.getData('students');
        $scope.semteacher = store.getData('semteacher');
        $scope.modification = store.getData('modification');
        $scope.eidtables = store.getData('editables');
        $scope.editClass = '';
        $scope.clicked = '';

        $scope.edit = false;
        $scope.editText = $scope.lang.edit_text;
        $scope.selectedSemi = 0;
        $scope.is_editable = false;
        $scope.noSem = parseInt(store.getData('course_sems'));
        $scope.lastCem = (store.getData('last_cem') === null) ? 0 : parseInt(store.getData('last_cem'));
        $scope.attendance_count = 0;
        console.log($scope.eidtables);
        $scope.savedData = store.getData('savedData');
        $scope.editedData = store.getData('editedData');

        $scope.getSemarray = function (num) {

            return new Array(num);
        };

        $scope.editpower = false;
        $scope.timeleft = 0;
        var mytimeout;

        $scope.editModechk = function () {

            if ($scope.mod) {
                var response = localFactory.post('ManroxModeratorAllowedForEditChk' + "/" + store.getData('user').user_no, {});
                response.success(function (data) {
                    localFactory.unload();
                    if (data === "true") {
                        $scope.editpower = true;
                    }
                    else {
                        $scope.editpower = false;
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload();
                    console.log("error", status);
                });
            }
        };

        $scope.chkeditpowerforTeacher = function () {
            if ($scope.teacher) {
                var response = localFactory.post('ManroxTeacherAllowedForEditChk' + "/" + store.getData('user').user_no, {});
                response.success(function (data) {
                    localFactory.unload();
                    if (data.isSubmitted && data.editPermission && ((data.allotedtime - data.time_diffrence)) > 0) {
                        $scope.editpower = true;
                        $scope.timeleft = data.allotedtime - data.time_diffrence;
                        mytimeout = $timeout($scope.onTimeout, 1000);
                    }
                    else {
                        $scope.editpower = false;
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload();
                    console.log("error", status);
                });
            } else if ($scope.mod) {
                $scope.editModechk();
            }
            else if ($scope.admin) {
                $scope.editpower = true;
            }
        }

        $scope.chkeditpowerforTeacher();


        $scope.onTimeout = function () {
            $scope.timeleft--;
            if ($scope.timeleft <= 0) {
                $scope.editpower = false;
                $scope.stop();
            }
            else {
                mytimeout = $timeout($scope.onTimeout, 1000);
            }
        }

        $scope.stop = function () {
            $timeout.cancel(mytimeout);
        }

        $scope.showTeacherName = function (teacher, index) {
            try {
                localFactory.toast($scope.lang.by + " : " + teacher.teacher);
            } catch (e) {
                console.log(e.message);
            }
        };
        $scope.stdent_sheet = {};
        $scope.stdent_sheet.removal_sheet = [];
        $scope.addCredential = function () {
            if ($scope.lastCem == 0) {
                $scope.edit = false;
            }
            $scope.stdent_sheet.user_no = store.getData('user').user_no;
            $scope.stdent_sheet.cid = store.getData('course_id');
            $scope.setSheet();

        };

        $scope.setSheet = function () {
            $scope.stdent_sheet.sheet = {};
            for (var i = 1; i <= $scope.noSem; i++) {
                $scope.stdent_sheet.sheet['cem-' + i] = {};
            }
        };

        $scope.addCredential();
        $scope.warnToAttendance = function () {
            alert("لم يتم إرسال الغياب حتى الآن");
        }


        $scope.editMode = function () {

            //store.getData('user').user_no
            // if ($scope.mod) {
            //     var response = localFactory.post('ManroxModeratorAllowedForEditChk' + "/" + store.getData('user').user_no, {});
            //     response.success(function (data) {
            //         localFactory.unload();
            //         if (data === "true") {
            //             if ($scope.edit) {
            //                 $scope.edit = false;
            //                 $scope.editText = $scope.lang.edit_text;
            //                 $scope.editClass = '';
            //             } else {
            //                 $scope.editText = $scope.lang.cancel;
            //                 $scope.edit = true;
            //                 $scope.editClass = 'edit-mode';
            //             }
            //         }
            //         else {
            //             alert("لا يمكنك تعديل الغياب");
            //         }
            //     });
            //     response.error(function (data, status, headers, config) {
            //         localFactory.unload(); // this isn't happening:
            //         console.log("error", status);
            //     });
            // }
            // else if ($scope.admin || ($scope.teacher && $scope.editpower)) {
                if ($scope.edit) {
                    $scope.edit = false;
                    $scope.editText = $scope.lang.edit_text;
                    $scope.editClass = '';
                } else {
                    $scope.editText = $scope.lang.cancel;
                    $scope.edit = true;
                    $scope.editClass = 'edit-mode';
                }
            // }
        };
        var clickedbox = [];
        var rownumber = [];

        $scope.giveAttendance = function (sid, index, $event) {

            $scope.noneditable = false;
            var idval = $($event.target).parent().attr('id');
            var stucount = parseInt(idval / 10);
            var seminarno = parseInt(idval % 10) + 1;
            var item = document.getElementById(seminarno);
            var tt = $(item).attr('class');
            var classval11 = $($event.target).parent().attr('class');

            if (classval11.indexOf('delayabsent') >= 0) {
                console.log("delayed mark");
                $scope.noneditable = true;
            }

            var user_id = store.getData('user').user_no;
            if($scope.students[stucount-1].sheet['entered_by-' + (index + 1)] && $scope.students[stucount-1].sheet['entered_by-' + (index + 1)] != user_id && $scope.teacher){
                localFactory.toast("لا يمكنك تعديل التأخير");
                return false;
            }

            if($scope.students[stucount-1].sheet['cem-' + (index + 1)] === "0" && !$scope.editpower){
                console.log("delayed mark");
                $scope.noneditable = true;
            }

            if($scope.students[stucount-1].sheet['cem-' + (index + 1)] === "1" && !$scope.editpower){
                console.log("attendance mark");
                $scope.noneditable = true;
            }

            $rootScope.notcompleted = false;

            var stulist = store.getData('students');
            for (var i = 0; i < stulist.length; i++) {
                if (Object.keys(stulist[i].sheet).length == 0) {
                    $rootScope.notcompleted = true;
                }
            }

            localFactory.load();

            if ((($scope.teacher || ($scope.mod && !$scope.editpower)) && tt.indexOf('at-done') > 0 && !$scope.edit && $rootScope.notcompleted == false))
            {
                localFactory.unload();
                //alert("Attendance already taken you are not allowed");
                localFactory.toast("لقد تم إدخال الغياب مسبقاً");
            }
            else {

                if ($scope.noneditable && !$scope.admin) {
                    localFactory.unload();
                    localFactory.toast("لا يمكنك تعديل التأخير");
                    //alert("You can not edit delayed student.");
                }
                else {
                    var validflag = true;
                    if (clickedbox.length > 0) {
                        for (var i = 0; i < clickedbox.length; i++) {
                            if ((parseInt(clickedbox[i] % 10) + 1) != seminarno) {
                                validflag = false;
                            }
                        }
                    }
                    if (validflag || ($scope.mod && $scope.editpower) || $scope.admin) {
                        if (clickedbox.indexOf(idval) < 0) {
                            clickedbox.push(idval);
                            $scope.selectedSemi = seminarno;
                        }
                    }
                    else {
                        localFactory.unload();
                        localFactory.toast("برجاء إدخال غياب جميع الطلاب");
                    }

                    if ($scope.admin || ($scope.mod && $scope.editpower)) {
                        $scope.validflag = true;
                    }

                    if (validflag || $scope.admin || ($scope.mod && $scope.editpower )){
                        localFactory.unload();
                        if ($scope.parent) {
                            localFactory.toast($scope.lang.you_cant_do_this);
                            return false;
                        }
                        var ind = index + 1;
                        var date_type = store.getData('date_type');
                        var is_editable = false;
                        try {
                            if (Object.keys($scope.eidtables).length > 0) {
                                if (typeof $scope.eidtables['sid-' + sid]['cem-' + ind] === 'undefined') {
                                    is_editable = false;
                                } else {
                                    is_editable = true;
                                }
                            }
                        } catch (e) {
                            console.log(e.message);
                        }

                        $scope.is_editable = is_editable;
                        if (($scope.teacher || ($scope.mod && !$scope.editpower)) && date_type == 2) {
                            localFactory.toast($scope.lang.you_cant_do_this);
                            return false;
                        }
                        // if (!$scope.admin && $scope.lastCem >= $scope.noSem && !is_editable) {
                        //     localFactory.toast($scope.lang.attendance_complete);
                        //     return false;
                        // }

                        if (($scope.teacher && $scope.editpower && !$scope.edit) || ($scope.mod && $scope.editpower && !$scope.edit) || ($rootScope.isadmin && !$scope.edit)) {
                            localFactory.toast($scope.lang.select_edit);
                            return false;
                        } else if (!$scope.admin && Object.keys($scope.eidtables).length > 0 && is_editable) {

                        }

                        var classval = $($event.target).parent().attr('class');
                        var present = 0;
                        var wipeOut = false;
                        if ($scope.admin && classval.indexOf('absent') >= 0) {
                            $($event.target).parent().removeClass('absent');
                            var ind = (index + 1);
                            var here = false;
                            if ($scope.stdent_sheet.removal_sheet.length > 0) {
                                for (var i = 0; i < $scope.stdent_sheet.removal_sheet.length; i++) {
                                    try {
                                        if ($scope.stdent_sheet.removal_sheet[i].sid == sid && $scope.stdent_sheet.removal_sheet[i].sem == ind) {
                                            here = true;
                                        }
                                    } catch (e) {
                                    }
                                }
                            }
                            if (!here) {
                                $scope.stdent_sheet.removal_sheet.push({
                                    sem: ind,
                                    sid: sid
                                });
                                try {
                                    delete $scope.stdent_sheet.sheet['cem-' + ind]['sid-' + sid];
                                } catch (e) {
                                    console.log('Error :', e.message);
                                }
                            }
                            wipeOut = true;
                        } else if (classval.indexOf('present') <= 0 && classval.indexOf('absent') <= 0) {
                            $($event.target).parent().addClass('present');
                            present = 1;
                        } else if (classval.indexOf('present') > 0) {
                            $($event.target).parent().removeClass('present');
                            $($event.target).parent().addClass('absent');
                            present = 0;
                        } else if (classval.indexOf('absent') > 0) {
                            $($event.target).parent().removeClass('absent');
                            $($event.target).parent().addClass('present');
                            present = 1;
                        }
                        if (wipeOut) {
                            console.log("Removal sheet", $scope.stdent_sheet.removal_sheet);
                            return false;
                        }
                        $scope.pushJson(index + 1, sid, present);
                    }
                }
            }
        };

        $scope.giveAttendanceEditMode = function (sid, index, $event) {
            //debugger;
            //store.getData('date')
            localFactory.load();

            //Detect code , previous attendance is completed or not , client stopped this code
            // var validPreviousSeminar=true;
            //var idval = $($event.target).parent().attr('id');

            // for(var a=1; a<=index; a++)
            // {
            //     //var iid=$("'#"+idval+"'").attr('class');
            //    // var id = angular.element(idval);
            //    var item = document.getElementById(idval-a);
            //    var iid=$(item).attr('class');
            //    if (iid.indexOf('present') <= 0 && iid.indexOf('absent') <= 0) {
            //     console.log('blank'+idval);
            //     validPreviousSeminar=false;
            //    }


            // }

            //End of detection code

            // var idval = $($event.target).parent().attr('id');
            // var stucount = parseInt(idval/10);
            // var seminarno = parseInt(idval%10)+1;
            // if(clickedbox.indexOf(idval))
            // {
            //     clickedbox.push(idval);
            // }
            var idval = $($event.target).parent().attr('id');
            var stucount = parseInt(idval / 10);
            var seminarno = parseInt(idval % 10) + 1;
            var item = document.getElementById(seminarno);
            var tt = $(item).attr('class');
            if ($scope.editpower === false && !$scope.admin && !$scope.mod && tt.indexOf('at-done') > 0) {
                localFactory.unload();
                console.log("Not Allowed");
                localFactory.toast("لقد تم إدخال الغياب مسبقاً");
                //alert("Attendance already taken you are not allowed");
            }
            else {



                var validflag = true;
                if (clickedbox.length > 0) {
                    for (var i = 0; i < clickedbox.length; i++) {
                        if ((parseInt(clickedbox[i] % 10) + 1) == seminarno) {

                        }
                        else {
                            validflag = false;
                        }
                    }
                }
                if (validflag) {
                    if (clickedbox.indexOf(idval) < 0) {
                        clickedbox.push(idval);
                    }
                }
                else {
                    localFactory.unload();
                    localFactory.toast("برجاء إدخال غياب جميع الطلاب");
                    //alert("Please complete last seminar for all students. If you want to start new then go back(with the help of back button of top bar) and start it again.");
                }



                // var response = localFactory.post('attendanceBySeminar/' + sid+'/'+store.getData('date')+'/'+index+'', { });
                // response.success(function(data) {
                //     localFactory.unload();
                //    console.log(data);
                //    if(data.result == 1)
                //    {

                //    }
                //    else{
                //        alert("Please mark previous seminar first.");
                //    }
                // });
                // response.error(function(data, status, headers, config) {
                //     localFactory.unload(); // this isn't happening:
                //     console.log("error", status);
                // });
                // if(validPreviousSeminar){
                if ($scope.admin || $scope.mod) {
                    $scope.validflag = true;
                }
                if (validflag) {
                    localFactory.unload();
                    if ($scope.parent) {
                        localFactory.toast($scope.lang.you_cant_do_this);
                        return false;
                    }
                    var ind = index + 1;
                    var date_type = store.getData('date_type');
                    var is_editable = false;
                    try {
                        if (Object.keys($scope.eidtables).length > 0) {
                            if (typeof $scope.eidtables['sid-' + sid]['cem-' + ind] === 'undefined') {
                                is_editable = false;
                            } else {
                                is_editable = true;
                            }
                        }
                    } catch (e) {
                        console.log(e.message);
                    }
                    $scope.is_editable = is_editable;
                    if ($scope.teacher && date_type == 2) {
                        localFactory.toast($scope.lang.you_cant_do_this);
                        return false;
                    }
                    // if (!$scope.admin && $scope.lastCem >= $scope.noSem && !is_editable) {
                    //     localFactory.toast($scope.lang.attendance_complete);
                    //     return false;
                    // }


                    if (($scope.admin || $scope.editpower) && !$scope.edit) {
                        //Admin but not edit mode
                        localFactory.toast($scope.lang.select_edit);
                        return false;
                    } else if (!$scope.admin && Object.keys($scope.eidtables).length > 0 && is_editable) {

                    }
                    // else if (!$scope.admin && (ind - 1) < $scope.lastCem) {
                    //     //Not past sem for teacher
                    //     localFactory.toast($scope.lang.give_attence_of + ($scope.lastCem + 1));
                    //     return false;
                    // } 
                    else if ($scope.admin && !$scope.edit && (ind - 1) < $scope.lastCem) {
                        localFactory.toast($scope.lang.select_edit);
                        return false;
                    } else if ($scope.admin && !$scope.edit && ind > ($scope.lastCem + 1)) {
                        localFactory.toast($scope.lang.select_edit);
                        return false;
                    }
                    // this code , to prevent take attendance for sem 3 before sem 1 , requested by client : 16-nov 2017 by mail
                    // else if (!$scope.admin && ind > ($scope.lastCem + 1)) {
                    //     //Not future sem for teacher
                    //     localFactory.toast($scope.lang.give_attence_of + ($scope.lastCem + 1));
                    //     return false;
                    // }

                    var classval = $($event.target).parent().attr('class');
                    var present = 0;
                    var wipeOut = false;
                    //debugger;
                    // if ($scope.admin && classval.indexOf('absent') >= 0) {
                    //    // $($event.target).parent().removeClass('absent');
                    //     var ind = (index + 1);
                    //     var here = false;
                    //     // code commented on 23 jan 2018
                    //     if ($scope.stdent_sheet.removal_sheet.length > 0) {
                    //         for (var i = 0; i < $scope.stdent_sheet.removal_sheet.length; i++) {
                    //             try {
                    //                 if ($scope.stdent_sheet.removal_sheet[i].sid == sid && $scope.stdent_sheet.removal_sheet[i].sem == ind) {
                    //                     here = true;
                    //                 }
                    //             } catch (e) {
                    //                 //                        console.log('Error :',e.message);
                    //             }
                    //         }
                    //     }
                    //     if (!here) {
                    //         $scope.stdent_sheet.removal_sheet.push({
                    //             sem: ind,
                    //             sid: sid
                    //         });
                    //         try {
                    //             delete $scope.stdent_sheet.sheet['cem-' + ind]['sid-' + sid];
                    //         } catch (e) {
                    //             console.log('Error :', e.message);
                    //         }
                    //     }
                    //     wipeOut = true;
                    // } else 
                    //upper code commented on 23 jan 2018
                    if (classval.indexOf('present') <= 0 && classval.indexOf('absent') <= 0) {
                        $($event.target).parent().addClass('present');
                        present = 1;
                    } else if (classval.indexOf('present') > 0) {
                        $($event.target).parent().removeClass('present');
                        $($event.target).parent().addClass('absent');
                        present = 0;
                    } else if (classval.indexOf('absent') > 0) {
                        $($event.target).parent().removeClass('absent');
                        $($event.target).parent().addClass('present');
                        present = 1;
                    }
                    if (wipeOut) {
                        console.log("Removal sheet", $scope.stdent_sheet.removal_sheet);
                        return false;
                    }
                    $scope.pushJson(index + 1, sid, present);
                }
            }
        };

        $scope.pushJson = function (index, sid, present) {
            //debugger;
            if ($scope.stdent_sheet.removal_sheet.length > 0) {
                for (var i = 0; i < $scope.stdent_sheet.removal_sheet.length; i++) {
                    try {
                        if ($scope.stdent_sheet.removal_sheet[i].sid == sid && $scope.stdent_sheet.removal_sheet[i].sem == index) {
                            $scope.stdent_sheet.removal_sheet.splice(i, 1);
                        }
                    } catch (e) {
                        console.log('Error :', e.message);
                    }
                }
            }
            //        else{
            //            $scope.stdent_sheet.removal_sheet = [];
            //        }
            $scope.stdent_sheet.sheet['cem-' + index]['sid-' + sid] = present;

            if ($scope.students.length > 0) {
                for (var i = 0; i < $scope.students.length; i++) {
                    if ($scope.students[i].sid == sid) {
                        $scope.students[i].sheet['cem-' + index] = (present == 1) ? true : false;
                    }
                }
            } else {
                //            alert($scope.students.length );
            }
            //        console.log('After Remove : ',$scope.stdent_sheet.removal_sheet);
        }

        $scope.viewStudent = function (sid) {
            if (clickedbox.length > 0) {
                localFactory.toast("برجاء إرسال الغياب أولاً");
                //alert("Sir, please submit attendance first.");
            }
            else {
                if ($scope.edit) {
                    localFactory.toast($scope.lang.save_attendance);
                    return false;
                }
                //        if(!$scope.admin){
                ////            localFactory.toast("Sorry you cant do this.");
                //            return false;
                //        }
                localFactory.load();

                var response = localFactory.post('viewStudent/' + sid, {
                    date: store.getData('date'),
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id'),
                    cid: store.getData('course_id'),
                });
                response.success(function (data) {
                    localFactory.unload();
                    if (!data.session) {
                        localFactory.alert($scope.lang.session_expire, function () {
                            window.location.hash = '#/';
                            localFactory.flushLocalItems();
                            if (!$scope.$$phase)
                                $scope.$apply();
                            localFactory.toast($scope.lang.logged_out)
                        });
                    } else {
                        store.addData('course', data.details.course);

                        store.addData('student', data.details);
                        $location.path('student');
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            }
        };

        $scope.sublitAttendance = function () {

            if ($scope.teacher || $scope.mod || $scope.edit) {
                if ($scope.teacher || ($scope.mod && !$scope.editpower)) {
                    var cnt = 0;
                    var len = Object.keys($scope.students[0].sheet).length
                    for (var j=0; j<$scope.students.length; j++){
                        if ($scope.students[j].sheet["cem-" + $scope.selectedSemi] !== undefined){ 
                            cnt++;
                        }
                    }
                    if (cnt != $scope.students.length){
                        localFactory.unload();
                        localFactory.toast("برجاء إدخال الغياب لجميع الطلاب");
                        return false;
                    }
                }
        
                $scope.stdent_sheet.session_id = localFactory.getLocalItem('session_id');
                $scope.stdent_sheet.date = store.getData('date');
                console.log('Show data');
                console.log(store.getData('user'));
        
                //Give attendance of all student of a seminer unless error
                if (!$scope.admin) {
                    var date_type = store.getData('date_type');
                    var semno = $scope.lastCem + 1;
                    if ($scope.teacher && date_type == 2) {
                        localFactory.toast($scope.lang.you_cant_do_this);
                        return false;
                    }
                    try {
                        // if ($scope.lastCem === $scope.noSem && !$scope.is_editable) {
                        //     localFactory.toast($scope.lang.attendance_complete);
                        //     return false;
                        // }
                    } catch (e) {
                        console.log(e.message);
                    }
                }
                if ($scope.stdent_sheet.removal_sheet.length <= 0 && $scope.stdent_sheet.sheet.length <= 0) {
                    localFactory.toast($scope.lang.nothing_edited);
                    return false;
                }
                console.log('Sheet : ', $scope.stdent_sheet);
                localFactory.load();
                //debugger;
                var response = localFactory.post('saveAttendance' + "/" + store.getData('user').school_id, $scope.stdent_sheet);
                response.success(function (data) {
                    localFactory.unload();
                    if (!data.session) {
                        localFactory.alert($scope.lang.session_expire, function () {
                            window.location.hash = '#/';
                            localFactory.flushLocalItems();
                            if (!$scope.$$phase)
                                $scope.$apply();
                            localFactory.toast($scope.lang.logged_out)
                        });
                    } else {
                        localFactory.toast(data.msg);
                        console.log(data);
                        $scope.setSheet();
                        $scope.attendance_count = 0;
                        var last_sem = data.last_sem;
                        $scope.savedData = data.saved;
                        $scope.editedData = data.edited;
                        store.addData('savedData', data.saved);
                        store.addData('editedData', data.edited);
                        $scope.edit = false;
                        $scope.editText = $scope.lang.edit_text;
                        $scope.editClass = '';
                        window.history.back();
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload();
                    console.log("error", status);
                });
            }
            else {
                localFactory.unload();
                localFactory.toast("برجاء إدخال الغياب لجميع الطلاب");
                //alert("Please fill all attendance.");
            }
        };
        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };
        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //  $location.path('#/');
        }
    }
]);

app.controller('attendancedelayController', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code) {

        var date = new Date();
        $scope.current_date = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString();
        $scope.delayRule = 5;
        var cid_delay = store.getData('course_id');
        var uno = store.getData('user').user_no;
        var sessid = localFactory.getLocalItem('session_id');
        $scope.noSem = 1;
        console.log(store.getData('user'));
        localFactory.load();
        var pre_students = [];
        var response = localFactory.post('getStudents_delay/' + cid_delay, {
            date: '2018-01-12',
            user_no: uno,
            session_id: sessid,
            school_id: store.getData('user').school_id
        });
        response.success(function (data) {

            localFactory.unload();
            if (!data.session) {
                alert(data.msg);
                localFactory.flushLocalItems();
                $location.path('login');
                return false;
            }
            var semnos = 1;
            //debugger;
            //store.addData('course_id',course_id);
            pre_students = data.students;
            store.addData('course_sems', semnos);
            store.addData('students', data.students);
            store.addData('last_cem', data.last_cem);
            store.addData('semteacher', data.semteacher);
            store.addData('editables', data.editables);
            store.addData('modification', data.modification);
            // store.addData('savedData', data.saved);
            // store.addData('editedData', data.edited);
            // $location.path('attendance');
            //debugger;
            $scope.isSubmitted = [];
            for (var dly = 0; dly < data.students.length; dly++) {
                if (data.students[dly].sheet["cem-1"]) {
                    $scope.isSubmitted[dly] = true;
                } else {
                    $scope.isSubmitted[dly] = false;
                }
            }

            $scope.date = store.getData('date');
            $scope.delayRule = data.delay_rule
            $scope.students = store.getData('students');
            $scope.semteacher = store.getData('semteacher');
            $scope.modification = store.getData('modification');
            //                console.log('Modification',$scope.modification);
            $scope.eidtables = store.getData('editables');
            
            $scope.clicked = '';
            $scope.edit = false;
            $scope.editText = $scope.lang.edit_text;
            $scope.editClass = '';
            $scope.is_editable = false;
            //debugger;
            $scope.noSem = 1; //parseInt(store.getData('course_sems'));
            $scope.lastCem = (store.getData('last_cem') === null) ? 0 : parseInt(store.getData('last_cem'));
            $scope.attendance_count = 0;
            console.log($scope.eidtables);
            $scope.savedData = store.getData('savedData');
            $scope.editedData = store.getData('editedData');
        });

        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.lastEdited = {};
        $scope.clsnm = localFactory.getLocalItem('clsnm');
        $scope.admin = (store.getData('user').user_type === "1") ? true : false;
        $scope.mod = (store.getData('user').user_type === "3") ? true : false;
        $scope.teacher = (store.getData('user').user_type === "2") ? true : false;
        $scope.parent = (store.getData('user').user_type === "4") ? true : false;
        $scope.hsem = 5;
        $scope.sarr = [];
        $scope.nextpage = function (num) {
            $scope.hsem = 5 * num;
            $scope.getl();
            // alert(num);
        }
        $scope.getSemarray = function (num) {

            return new Array(num);
        };
        $scope.getl = function () {
            $scope.sarr = [];
            var arraydt = $scope.hsem;
            for (var i = 0; i < 5; i++) {
                $scope.sarr.push(arraydt--);
            }
            console.log($scope.sarr);

        }
        $scope.getl();
        $scope.showTeacherName = function (teacher) {
            try {
                localFactory.toast($scope.lang.by + " : " + teacher.teacher);
            } catch (e) {
                console.log(e.message);
            }
        };
        $scope.stdent_sheet = {};
        $scope.stdent_sheet.removal_sheet = [];
        $scope.addCredential = function () {
            if ($scope.lastCem == 0) {
                $scope.edit = false;
            }
            $scope.stdent_sheet.user_no = store.getData('user').user_no;
            $scope.stdent_sheet.cid = store.getData('course_id');
            $scope.setSheet();

        };

        $scope.setSheet = function () {

            $scope.stdent_sheet.sheet = {};
            for (var i = 1; i <= $scope.noSem; i++) {
                $scope.stdent_sheet.sheet['cem-' + i] = {};
            }
        };

        $scope.addCredential();
        $scope.editModedelay = function () {

            if ($scope.edit) {
                $scope.edit = false;
                $scope.editText = $scope.lang.edit_text;
                $scope.editClass = '';
            } else {
                $scope.editText = $scope.lang.cancel;
                $scope.edit = true;
                $scope.editClass = 'edit-mode';
            }
        };
        var clickedbox = [];
        var rownumber = [];

        $scope.giveAttendance = function (sid, index, $event, myVar) {
           
                localFactory.unload();
                var response = localFactory.post('ManroxChkAttToday/' + sid, {});
                response.success(function (data) {
                    localFactory.unload();
                    console.log(data);
                    //debugger;
                    if (data === "true") {
                        var idval = $($event.target).parent().attr('id');
                        var stucount = parseInt(idval / 10);
                        var seminarno = parseInt(idval % 10) + 1;
                        var item = document.getElementById(seminarno);
                        var tt = $(item).attr('class');
                        if (!$scope.admin && !$scope.mod && tt.indexOf('at-done') > 0) {
                            localFactory.unload();
                            console.log("Not Allowed");
                            localFactory.toast("لقد تم إدخال الغياب مسبقاً");
                            //alert("Attendance already taken you are not allowed");
                        }
                        else {

                            var validflag = true;
                            if (clickedbox.length > 0) {
                                for (var i = 0; i < clickedbox.length; i++) {
                                    if ((parseInt(clickedbox[i] % 10) + 1) == seminarno) {

                                    }
                                    else {
                                        validflag = false;
                                    }
                                }
                            }
                            // if(validflag){
                            if (clickedbox.indexOf(idval) < 0) {
                                clickedbox.push(idval);
                            }
                            // }   
                            // else{
                            //     localFactory.unload();
                            //     alert("Please complete last seminar for all students. If you want to start new then go back(with the help of back button of top bar) and start it again.");
                            // }



                            // var response = localFactory.post('attendanceBySeminar/' + sid+'/'+store.getData('date')+'/'+index+'', { });
                            // response.success(function(data) {
                            //     localFactory.unload();
                            //    console.log(data);
                            //    if(data.result == 1)
                            //    {

                            //    }
                            //    else{
                            //        alert("Please mark previous seminar first.");
                            //    }
                            // });
                            // response.error(function(data, status, headers, config) {
                            //     localFactory.unload(); // this isn't happening:
                            //     console.log("error", status);
                            // });
                            // if(validPreviousSeminar){
                            if ($scope.admin || $scope.mod) {
                                $scope.validflag = true;
                            }
                            if (validflag) {
                                localFactory.unload();
                                if ($scope.parent) {
                                    localFactory.toast($scope.lang.you_cant_do_this);
                                    return false;
                                }
                                var ind = index + 1;
                                var date_type = store.getData('date_type');
                                var is_editable = false;
                                try {
                                    if (Object.keys($scope.eidtables).length > 0) {
                                        if (typeof $scope.eidtables['sid-' + sid]['cem-' + ind] === 'undefined') {
                                            is_editable = false;
                                        } else {
                                            is_editable = true;
                                        }
                                    }
                                } catch (e) {
                                    console.log(e.message);
                                }
                                $scope.is_editable = is_editable;
                                if ($scope.teacher && date_type == 2) {
                                    localFactory.toast($scope.lang.you_cant_do_this);
                                    return false;
                                }
                                if (!$scope.admin && $scope.lastCem >= $scope.noSem && !is_editable) {
                                    localFactory.toast($scope.lang.attendance_complete);
                                    return false;
                                }


                                if ($scope.admin && !$scope.edit) {
                                    //Admin but not edit mode
                                    localFactory.toast($scope.lang.select_edit);
                                    return false;
                                } else if (!$scope.admin && Object.keys($scope.eidtables).length > 0 && is_editable) {

                                } 

                                // else if ($scope.admin && !$scope.edit && (ind - 1) < $scope.lastCem) {
                                //     localFactory.toast($scope.lang.select_edit);
                                //     return false;
                                // } else if ($scope.admin && !$scope.edit && ind > ($scope.lastCem + 1)) {
                                //     localFactory.toast($scope.lang.select_edit);
                                //     return false;
                                // } 


                                var classval = $($event.target).parent().attr('class');
                                var present = 0;
                                var wipeOut = false;
                                //debugger;
                                if ($scope.admin && classval.indexOf('absent') >= 0) {
                                    $($event.target).parent().removeClass('absent');
                                    var ind = (index + 1);
                                    var here = false;
                                    if ($scope.stdent_sheet.removal_sheet.length > 0) {
                                        for (var i = 0; i < $scope.stdent_sheet.removal_sheet.length; i++) {
                                            try {
                                                if ($scope.stdent_sheet.removal_sheet[i].sid == sid && $scope.stdent_sheet.removal_sheet[i].sem == ind) {
                                                    here = true;
                                                }
                                            } catch (e) {
                                                //                        console.log('Error :',e.message);
                                            }
                                        }
                                    }
                                    if (!here) {
                                        $scope.stdent_sheet.removal_sheet.push({
                                            sem: ind,
                                            sid: sid
                                        });
                                        try {
                                            delete $scope.stdent_sheet.sheet['cem-' + ind]['sid-' + sid];
                                        } catch (e) {
                                            console.log('Error :', e.message);
                                        }
                                    }
                                    wipeOut = true;
                                } else if (classval.indexOf('present') <= 0 && classval.indexOf('absent') <= 0) {
                                    $($event.target).parent().addClass('present');
                                    present = 1;
                                }
                                else if (classval.indexOf('present') > 0) {
                                    var dd = $scope.stdent_sheet.sheet["cem-1"]["sid-" + sid];
                                    if (!$scope.isSubmitted || dd == 1 || $scope.edit) {
                                        $($event.target).parent().removeClass('present');
                                    }
                                    else {
                                        if ($scope.admin && !$scope.edit) {
                                            $scope.alreadyPresent = true;
                                            localFactory.toast("Please make it editable.");
                                            // alert("Please make it editable.");
                                        }
                                        else if ($scope.mod) {
                                            $scope.alreadyPresent = true;
                                            localFactory.toast("لقد تم إدخال الغياب مسبقاً");
                                            //alert("Already Submitted, please contact to admin to edit it.");
                                        }
                                    }
                                    // $($event.target).parent().addClass('absent');
                                    present = 0;
                                }
                                else if (classval.indexOf('absent') > 0) {
                                    $($event.target).parent().removeClass('absent');
                                    $($event.target).parent().addClass('present');
                                    present = 1;
                                }
                                if (wipeOut) {
                                    console.log("Removal sheet", $scope.stdent_sheet.removal_sheet);
                                    return false;
                                }
                                if (!$scope.alreadyPresent || ($scope.edit && $scope.admin))
                                    $scope.pushJson(index + 1, sid, present);
                            }
                        }
                    }
                    else {
                        localFactory.unload();
                        localFactory.toast("برجاء إدخال حالة الطالب أولاً");
                        // alert("Please mark attendance first for this student.");
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
        };

        $scope.pushJson = function (index, sid, present) {

            if ($scope.stdent_sheet.removal_sheet.length > 0) {
                for (var i = 0; i < $scope.stdent_sheet.removal_sheet.length; i++) {
                    try {
                        if ($scope.stdent_sheet.removal_sheet[i].sid == sid && $scope.stdent_sheet.removal_sheet[i].sem == index) {
                            $scope.stdent_sheet.removal_sheet.splice(i, 1);
                        }
                    } catch (e) {
                        console.log('Error :', e.message);
                    }
                }
            }
            //        else{
            //            $scope.stdent_sheet.removal_sheet = [];
            //        }
            $scope.stdent_sheet.sheet['cem-' + index]['sid-' + sid] = present;

            if ($scope.students.length > 0) {
                for (var i = 0; i < $scope.students.length; i++) {
                    if ($scope.students[i].sid == sid) {
                        $scope.students[i].sheet['cem-' + index] = (present == 1) ? true : false;
                    }
                }
            } else {
                //            alert($scope.students.length );
            }
            //        console.log('After Remove : ',$scope.stdent_sheet.removal_sheet);
        }
        $scope.viewStudent = function (sid) {
            if (clickedbox.length > 0) {
                localFactory.unload();
                localFactory.toast("يجب إرسال الغياب أولاً");
                //alert("Sir, please submit attendance first.");
            }
            else {
                if ($scope.edit) {
                    localFactory.toast($scope.lang.save_attendance);
                    return false;
                }
                //        if(!$scope.admin){
                ////            localFactory.toast("Sorry you cant do this.");
                //            return false;
                //        }
                //John's code
                localFactory.unload();
                //--//
                var response = localFactory.post('viewStudent/' + sid, {
                    date: store.getData('date'),
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id'),
                    cid: store.getData('course_id'),
                });
                response.success(function (data) {
                    localFactory.unload();
                    if (!data.session) {
                        localFactory.alert($scope.lang.session_expire, function () {
                            window.location.hash = '#/';
                            localFactory.flushLocalItems();
                            if (!$scope.$$phase)
                                $scope.$apply();
                            localFactory.toast($scope.lang.logged_out)
                        });
                    } else {
                        store.addData('course', data.details.course);

                        store.addData('student', data.details);
                        $location.path('student');
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            }
        };
        $scope.sublitAttendancedelay = function () {
            //debugger;
            if ((clickedbox.length == $scope.students.length) || $scope.mod || $scope.admin) {
                $scope.stdent_sheet.session_id = localFactory.getLocalItem('session_id');
                // $scope.stdent_sheet.date = store.getData('date');
                console.log('Show data');
                console.log(store.getData('user'));

                //Give attendance of all student of a seminer unless error
                if (!$scope.admin) {
                    var date_type = store.getData('date_type');
                    var semno = $scope.lastCem + 1;
                    if ($scope.teacher && date_type == 2) {
                        localFactory.toast($scope.lang.you_cant_do_this);
                        return false;
                    }
                    //            console.log('Object ',$scope.stdent_sheet.sheet);
                    try {
                        if ($scope.lastCem === $scope.noSem && !$scope.is_editable) {
                            localFactory.toast($scope.lang.attendance_complete);
                            return false;
                        }
                        // else if ($scope.teacher && Object.keys($scope.stdent_sheet.sheet['cem-' + semno]).length < $scope.students.length && !$scope.is_editable) {
                        //     localFactory.toast($scope.lang.give_all_attence_of + semno);
                        //     return false;
                        // }
                    } catch (e) {
                        console.log(e.message);
                    }
                }
                if ($scope.stdent_sheet.removal_sheet.length <= 0 && $scope.stdent_sheet.sheet.length <= 0) {
                    localFactory.toast($scope.lang.nothing_edited);
                    return false;
                }
                console.log($scope.stdent_sheet);
                localFactory.load();
                $scope.submittedbyuser = 0;
                if ($scope.mod) {
                    $scope.submittedbyuser = 2;
                }
                else if ($scope.admin) {
                    $scope.submittedbyuser = 1;
                }
                var response = localFactory.post('ManroxTesting2' + "/" + store.getData('user').school_id + "/" + $scope.submittedbyuser, $scope.stdent_sheet);
                response.success(function (data) {
                    localFactory.unload();

                    // if (!data.session) {
                    //     localFactory.alert($scope.lang.session_expire, function() {
                    //         window.location.hash = '#/';
                    //         localFactory.flushLocalItems();
                    //         if (!$scope.$$phase)
                    //             $scope.$apply();
                    //         localFactory.toast($scope.lang.logged_out)
                    //     });
                    // } else 
                    {
                        // localFactory.toast(data.msg);
                        localFactory.toast("تم إرسال التأخير");
                        //                for(var sheetval in $scope.stdent_sheet.sheet){
                        //                    alert(JSON.stringify(sheetval));
                        //                }
                        console.log(data);
                        $scope.setSheet();
                        $scope.attendance_count = 0;
                        var last_sem = data.last_sem;
                        // $scope.lastEdited = angular.extend($scope.lastEdited,data.edited) ;
                        //  $scope.lastCem = ($scope.lastCem != $scope.noSem) ? parseInt(last_sem) : $scope.lastCem;
                        $scope.savedData = data.saved;
                        $scope.editedData = data.edited;
                        $scope.edit = false;
                        $scope.editText = $scope.lang.edit_text;
                        $scope.editClass = '';
                        // $location.path('#/callenderView');
                        window.history.back();
                    }
                });
                response.error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                    if (status == 0) {
                        localFactory.toast("تم إرسال التأخير");
                        window.history.back();
                    }
                });
            }
            else {
                localFactory.unload();
                localFactory.toast("برجاء إدخال غياب جميع الطلاب");
                //alert("Please fill all attendance.");
            }
        };
        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };
        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //  $location.path('#/');
        }
    }
]);
app.controller('user', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code) {
        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.user_screen = true;
        $scope.user = angular.copy(store.getData('user'));
        if ($scope.user.user_type == 4) {
            $scope.user_parent = true;
        }
        $scope.edit = false;
        $scope.editButtontext = $scope.lang.edit_text;
        $scope.cencel = function () {
            $scope.edit = false;
            $scope.editButtontext = $scope.lang.edit_text;
        };
        $scope.enbEdit = function () {
            if ($scope.edit) {
                localFactory.load();
                localFactory.post('saveUser', {
                    user: $scope.user,
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id')
                }).success(function (data) {
                    localFactory.unload(); // this isn't happening:
                    if (!data.session) {
                        localFactory.alert($scope.lang.session_expire, function () {
                            window.location.hash = '#/';
                            localFactory.flushLocalItems();
                            if (!$scope.$$phase)
                                $scope.$apply();
                            localFactory.toast($scope.lang.logged_out);
                        });
                    } else if (!data.success) {
                        localFactory.alert(data.msg);
                        //                    $scope.edit = false;
                        //                    $scope.editButtontext  = $scope.lang.edit_text;
                    } else {
                        localFactory.toast(data.msg);
                        $scope.edit = false;
                        $scope.editButtontext = $scope.lang.edit_text;
                        store.addData('user', $scope.user);
                    }
                }).error(function (data, status, headers, config) {
                    $scope.edit = false;
                    $scope.editButtontext = $scope.lang.edit_text;
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            } else {
                $scope.edit = true;
                $scope.editButtontext = $scope.lang.save;
            }

        };

        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };
        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //  $location.path('#/');
        }
    }
]);
app.controller('childrenList', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code) {
        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';
        $scope.user = angular.copy(store.getData('user'));
        $scope.user_parent = false;
        if ($scope.user.user_type == 4) {
            $scope.user_parent = true;
        }
        console.log($scope.user);
        $scope.students = $scope.user.child;
        $scope.edit = false;
        $scope.editButtontext = $scope.lang.edit_text;
        $scope.cencel = function () {
            $scope.edit = false;
            $scope.editButtontext = $scope.lang.edit_text;
        };
        $scope.goBack = function () {
            if ((window.location) && (window.location.hash) && (window.location.hash == "#/children")) {
                return localFactory.confirm($scope.lang.want_to_logout, $scope.goBackCallback);
                //            navigator.app.exitApp();   // This will exit the application
            }
        };
        $scope.goBackCallback = function (yes) {
            if (yes == 1) {
                localFactory.load();
                localFactory.post('logout', {
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id')
                }).success(function (data) {
                    if (data.success) {
                        //                                        localFactory.alert(data.msg);
                        window.location.hash = '#/';
                        // $scope.$apply();
                        localFactory.unload(); // this isn't happening:
                        localFactory.toast($scope.lang.logged_out);
                    } else {
                        localFactory.alert(data.msg);
                        localFactory.unload(); // this isn't happening:
                    }
                }).error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
                localFactory.flushLocalItems();
            } else {
                return false;
            }
        };
        $scope.viewStudent = function (sid) {
            if ($scope.edit) {
                localFactory.toast($scope.lang.save_attendance);
                return false;
            }
            //        if(!$scope.admin){
            ////            localFactory.toast("Sorry you cant do this.");
            //            return false;
            //        }
            localFactory.load();

            var aa = store.getData('date');
            var bb = store.getData('user').user_no;
            var cc = localFactory.getLocalItem('session_id');
            var dd = store.getData('course_id');
            if (store.getData('user').user_type == "4") {
                aa = undefined;
                dd = undefined;
            }

            var response = localFactory.post('viewStudent/' + sid, {
                date: aa,
                user_no: bb,
                session_id: cc,
                cid: dd,
            });
            response.success(function (data) {
                localFactory.unload();
                if (!data.session) {
                    localFactory.alert($scope.lang.session_expire, function () {
                        window.location.hash = '#/';
                        localFactory.flushLocalItems();
                        if (!$scope.$$phase)
                            $scope.$apply();
                        localFactory.toast($scope.lang.logged_out)
                    });
                } else {

                    store.addData('course', data.details.course);

                    store.addData('student', data.details);
                    $location.path('student');
                }
            });
            response.error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };

        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };
        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            location.href = "index.html";
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //  $location.path('#/');
        }
    }
]);
app.controller('studentView', ['$scope', '$rootScope', '$location', 'localFactory', 'store', 'lang', 'lang_code', '$filter',
    function ($scope, $rootScope, $location, localFactory, store, lang, lang_code, $filter) {

        $scope.lang = lang.getLang();
        $scope.pageClass = 'page-about';

        $scope.student = store.getData('student');
        $scope.strParents = (store.getData('user').user_type == "4") ? true : false;
        $scope.admin = (store.getData('user').user_type == "1") ? true : false;
        $scope.mod = (store.getData('user').user_type == "3") ? true : false;
        $scope.canDelete = (store.getData('user').user_type == "1") ? true : false;
        $scope.teacher = (store.getData('user').user_type == "2") ? true : false;

        //    if($scope.parent){
        //        $scope.user_parent = true;
        //    }

        $scope.edit = false;
        $scope.editButtontext = $scope.lang.edit_text;
        $scope.notetext = {};
        $scope.date = store.getData('date');
        $scope.course = store.getData('course');

        $scope.tap1show = true;
        $scope.tap1style = "'color': 'red'";
        $scope.tap1st = "tap1active";
        $scope.tap2st = "tap2";
        //$scope.tap2show = false;
        $scope.tap1 = function () {
            $scope.tap1show = true;
            $scope.tap1st = "tap1active";
            $scope.tap2st = "tap2";
            //$scope.tap2show = false;
        }
        $scope.tap2 = function () {
            $scope.tap1show = false;
            $scope.tap1st = "tap1";
            $scope.tap2st = "tap2active";
            // $scope.tap2show = true;
        }
        // if($scope.student.absents.length>0)
        // {

        // }
        // else{
        //     $scope.student = store.getData('student');
        // }
        $scope.student.meta = store.getData('student').meta;
        //    if( !$scope.edit ){
        //        $scope.editButtontext  = 'Edit';
        //    }
        $scope.deleteNote = function (note_id, notes, index) {
            localFactory.confirm($scope.lang.want_to_delete, function (status) {
                if (status === 1) {
                    localFactory.load();
                    localFactory.post('deleteNote/' + note_id, {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        localFactory.unload(); // this isn't happening:
                        if (!data.session) {
                            localFactory.alert($scope.lang.session_expire, function () {
                                window.location.hash = '#/';
                                localFactory.flushLocalItems();
                                if (!$scope.$$phase)
                                    $scope.$apply();
                                localFactory.toast($scope.lang.logged_out)
                            });
                        } else {
                            localFactory.toast(data.msg);
                            notes.splice(index, 1);
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                } else {
                    return false;
                }
            });
        };
        $scope.deleteNotenew = function (note_id, notes, index) {
            //debugger;
            localFactory.confirm($scope.lang.want_to_delete, function (status) {
                if (status === 1) {
                    localFactory.load();
                    localFactory.post('deleteStudentNote/' + note_id, {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        localFactory.unload(); // this isn't happening:
                        // localFactory.toast(data.msg);
                        $scope.notes.items.splice(index, 1);

                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                } else {
                    return false;
                }
            });
        };
        $scope.cencel = function () {
            $scope.edit = false;
            $scope.editButtontext = $scope.lang.edit_text;
        };
        $scope.getDatetime = new Date();
        $scope.noteclient = "";
        $scope.notes = { items: [] };
        $scope.saveNote = function (date, notes, index) {
            if ($scope.notetext[index] == '' || $scope.notetext[index] == null) {
                localFactory.toast($scope.lang.give_note);
                return false;
            }
            //        alert(index);
            //        alert($scope.notetext[index]);
            //        return false;
            localFactory.load();

            localFactory.post('saveNote', {
                sid: $scope.student.sid,
                cid: store.getData('course_id'),
                date: date,
                note: $scope.notetext[index],
                user_no: store.getData('user').user_no,
                session_id: localFactory.getLocalItem('session_id')
            }).success(function (data) {
                localFactory.unload(); // this isn't happening:
                if (!data.session) {
                    localFactory.alert($scope.lang.session_expire, function () {
                        window.location.hash = '#/';
                        localFactory.flushLocalItems();
                        if (!$scope.$$phase)
                            $scope.$apply();
                        localFactory.toast($scope.lang.logged_out)
                    });
                } else {
                    localFactory.toast(data.msg);
                    notes.push({
                        note: $scope.notetext[index],
                        ID: data.note_id
                    });
                    $scope.notetext[index] = '';
                }
            }).error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };



        $scope.saveNotenew = function (notes, index) {
            if ($scope.notetext[index] == '' || $scope.notetext[index] == null) {
                localFactory.toast($scope.lang.give_note);
                return false;
            }
            //        alert(index);
            //        alert($scope.notetext[index]);
            //        return false;
            localFactory.load();
            // localFactory.post('plan_subscribe', {'plan_id':$scope.planid,'school_name':$scope.schoolname,'detail':$scope.address,'user_id':$scope.emailid,'password':$scope.password,'email_id':$scope.emailid,'paypal_trans_id':$scope.planid,'status':'success','contact':$scope.contact,'duration':$scope.rad.undefined}).success(function(data) {
            //     localFactory.unload();
            //     console.log(data);
            // })
            localFactory.post('addStudentNote', { 'sid': $scope.student.sid, 'note': $scope.notetext[index], 'user_id': store.getData('user').user_no }).success(function (data) {
                localFactory.unload(); // this isn't happening:
                //debugger;
                // if (!data.session) {
                //     localFactory.alert($scope.lang.session_expire, function() {
                //         window.location.hash = '#/';
                //         localFactory.flushLocalItems();
                //         if (!$scope.$$phase)
                //             $scope.$apply();
                //         localFactory.toast($scope.lang.logged_out)
                //     });
                // } else {
                // localFactory.toast(data.msg);
                $scope.cdate = new Date();
                $scope.notes.items.push({
                    note: $scope.notetext[index],
                    ID: data.note_id,
                    user: store.getData('user').first_name + " " + store.getData('user').last_name,
                    notedate: $scope.cdate
                });
                $scope.notetext[index] = '';
                // }
            }).error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        };

        $scope.fillnotes = function () {
            localFactory.load();
            localFactory.post('getStudentNote/' + $scope.student.sid, {
                sid: $scope.student.sid,
                cid: store.getData('course_id'),
                date: '',
                note: '',
                user_no: store.getData('user').user_no,
                session_id: localFactory.getLocalItem('session_id')
            }).success(function (data) {
                localFactory.unload(); // this isn't happening:
                //debugger;
                console.log(data);
                if (data.notes.length > 0) {
                    for (var i = 0; i < data.notes.length; i++) {
                        $scope.notes.items.push({
                            note: data.notes[i].note,
                            ID: data.notes[i].id,
                            user: data.notes[i].first_name + " " + data.notes[i].last_name,
                            notedate: $filter('date')(new Date(data.notes[i].date), 'yyyy-MM-dd')
                        });
                    }
                    console.log($scope.notes);
                }

                // $scope.notetext[index] = '';

            }).error(function (data, status, headers, config) {
                localFactory.unload(); // this isn't happening:
                console.log("error", status);
            });
        }
        $scope.fillnotes();
        $scope.enbEdit = function () {
            if ($scope.edit) {
                localFactory.load();
                localFactory.post('saveStudent', {
                    student: {
                        name: $scope.student.name
                    },
                    sid: $scope.student.sid,
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id'),
                }).success(function (data) {
                    localFactory.unload(); // this isn't happening:
                    if (!data.session) {
                        localFactory.alert($scope.lang.session_expire, function () {
                            window.location.hash = '#/';
                            localFactory.flushLocalItems();
                            if (!$scope.$$phase)
                                $scope.$apply();
                            localFactory.toast($scope.lang.logged_out);
                        });
                    } else {
                        localFactory.toast(data.msg);
                        $scope.edit = false;
                        $scope.editButtontext = $scope.lang.edit_text;
                    }
                }).error(function (data, status, headers, config) {
                    $scope.edit = false;
                    $scope.editButtontext = $scope.lang.edit_text;
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            } else {
                $scope.edit = true;
                $scope.editButtontext = $scope.lang.save;
            }

        };
        $scope.delete = function () {
            localFactory.confirm($scope.lang.want_to_delete_student, $scope.goDelete);
        };
        $scope.goDelete = function (yes) {

            if (yes == 1) {
                localFactory.load();
                localFactory.post('deleteStudent', {
                    sid: $scope.student.sid,
                    cid: store.getData('course_id'),
                    user_no: store.getData('user').user_no,
                    session_id: localFactory.getLocalItem('session_id'),
                }).success(function (data) {
                    localFactory.unload(); // this isn't happening:
                    if (!data.session) {
                        localFactory.alert($scope.lang.session_expire, function () {
                            window.location.hash = '#/';
                            localFactory.flushLocalItems();
                            if (!$scope.$$phase)
                                $scope.$apply();
                            localFactory.toast($scope.lang.logged_out)
                        });
                    } else {
                        localFactory.alert(data.msg);
                        $location.path('callenderView');
                    }
                }).error(function (data, status, headers, config) {
                    localFactory.unload(); // this isn't happening:
                    console.log("error", status);
                });
            } else {
                return false;
            }
        };
        $scope.goBack = function () {
            $location.path('attendance');

        };

        var time = 300;
        $scope.showNav = function () {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions = function () {
            $(".popup-overlay").fadeOut(time);
        };

        $rootScope.logout = function () {
            localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
                if (yes == 1) {
                    localFactory.load();
                    localFactory.post('logout', {
                        user_no: store.getData('user').user_no,
                        session_id: localFactory.getLocalItem('session_id')
                    }).success(function (data) {
                        if (data.success) {
                            //                                        localFactory.alert(data.msg);
                            window.location.hash = '#/';
                            // $scope.$apply();
                            localFactory.unload(); // this isn't happening:
                            localFactory.toast(localFactory.lang.logged_out);
                        } else {
                            localFactory.alert(data.msg);
                            localFactory.unload(); // this isn't happening:
                        }
                    }).error(function (data, status, headers, config) {
                        localFactory.unload(); // this isn't happening:
                        console.log("error", status);
                    });
                    localFactory.flushLocalItems();

                } else {
                    return false;
                }
            });
            //   $location.path('#/');
        }

    }
]);
