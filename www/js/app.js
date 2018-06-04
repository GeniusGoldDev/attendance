/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
window.onload = onLoad;
var clickCount = 0;
var Push_ID = window.localStorage.getItem("push_id");
// Wait for device API libraries to load
function onLoad() {

    document.addEventListener("deviceready", onDeviceReady, false);
}
var pushNotification;
// device APIs are available
function onDeviceReady() {
    // Register the event listener
    var os_type = 0;
    pushNotification = window.plugins.pushNotification;
    document.addEventListener("backbutton", onBackKeyDown, true);

    try {
        if (device.platform == 'android' || device.platform == 'Android') {
            if (!Push_ID) {
                pushNotification.register(successHandler, errorHandler, {
                   // "senderID": "915938865014",
                    "senderID": "750430029357",
                    "ecb": "onNotificationGCM"
                });
            }
        }
        if (device.platform == 'android' || device.platform == 'Android') {
            os_type = 1;
        }
        window.localStorage.setItem('device_id', device.uuid);
        window.localStorage.setItem('os_type', os_type);
        console.log(device.uuid);
    } catch (e) {

        console.log(e.message);
    }
}
function onNotificationGCM(e) {
    if (e.event == "registered") {
        var reg_id = e.regid;
       // alert(reg_id);
        window.localStorage.setItem("push_id", reg_id);
        console.log(reg_id);
    }
}
// result contains any message sent from the plugin call
function successHandler(result) {
    console.log(result);
    //alert('result = ' + result);
}
// result contains any error description text returned from the plugin call
function errorHandler(error) {
    console.log(error);
    //alert('error = ' + error);
}
// Handle the back button
function onBackKeyDown() {
    var user_type = window.localStorage.getItem('user_type');
    var cntlr = '[ng-controller=classes]';
    if (user_type == 4) {
        cntlr = '[ng-controller=childrenList]';
    }
//    alert(user_type);
    var scope = angular.element($(cntlr)).scope();
    if (typeof scope !== 'undefined') {
        scope.goBack();
    } else if (window.location.hash == '#/') {
        if (clickCount == 2) {
            try {
                clickCount = 0;
                navigator.app.exitApp()
            } catch (e) {
                console.log(e.message);
            }
        } else {
            try {
                window.plugins.toast.show(scope.lang.click_twise, 'short', 'bottom');
            } catch (e) {
                console.log(e.message);
            }
            clickCount++;
        }
        return false;
    } else {
        window.history.back();
    }
}

var app = angular.module('attendance', ['ngRoute', 'ngAnimate', 'ui.calendar', 'ui.bootstrap','ngCordova','ionic', 'ionic.service.core', 'ionic.service.push']);

    
app.constant('shopSettings',{
    
               // payPalSandboxId :'AZREwCWpm0zAvziz-Z_PLKiPAuUwLSxQnSWGl5jtY8WKdpMYmke9T57obejUba4Xu3_91FltVSKLHo8C',
                payPalSandboxId : 'AZREwCWpm0zAvziz-Z_PLKiPAuUwLSxQnSWGl5jtY8WKdpMYmke9T57obejUba4Xu3_91FltVSKLHo8C',
                payPalProductionId : 'production id',
    
              //  payPalEnv: 'PayPalEnvironmentProduction', // PayPalEnvironmentSandbox for testing production for production for sand box : PayPalEnvironmentSandbox
    
              payPalEnv: 'PayPalEnvironmentSandbox',

                payPalShopName : 'MyShopName',
    
                payPalMerchantPrivacyPolicyURL : 'url to policy',
    
                payPalMerchantUserAgreementURL : ' url to user agreement '
    
                }); 
app.value('lang_code', 'arb');
app.service('lang', ['lang_code', '$http', function (lang_code, $http) {
        var myData = null;
//    var lang = lang_code;
        var promise = $http.get('lang/lang_' + lang_code + '.json').success(function (data) {
            myData = data;
        });
        return {
            promise: promise,
            setData: function (data) {
                myData = data;
            },
            getLang: function () {
                return myData;//.getSomeData();
            }
        };
    }]);
app.directive('ngBack', ['$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    var cntrl = '[ng-controller=classes]';
                    if (window.localStorage.getItem('user_type') == 4) {
                        cntrl = '[ng-controller=childrenList]';
                    }
                    var scope = angular.element($(cntrl)).scope();
                    if (typeof scope !== 'undefined') {
                        scope.goBack();
                    } else if ($window.location.hash == '#/') {
                        return false;
                    } else {
                        $window.history.back();
                    }
                });
            }
        };
    }]);
app.directive('ngHome', ['$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    var cntrl = '#/classes';
                    if (window.localStorage.getItem('user_type') == 4) {
                        cntrl = '#/children';
                    }
                    $window.location.hash = cntrl;
                });
            }
        };
    }]);
app.directive('ngLogout', ['$window', 'localFactory', 'store', function ($window, localFactory, store) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    return localFactory.confirm(localFactory.lang.want_to_logout, function (yes) {
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
                                    localFactory.unload();// this isn't happening:
                                    localFactory.toast(localFactory.lang.logged_out);
                                } else {
                                    localFactory.alert(data.msg);
                                    localFactory.unload();// this isn't happening:
                                }
                            }).error(function (data, status, headers, config) {
                                localFactory.unload();// this isn't happening:
                                console.log("error", status);
                            });
                            localFactory.flushLocalItems();

                        } else {
                            return false;
                        }
                    });

                  //  $window.location.hash = '#/';
                });
            }
        };
    }]);

app.filter('reverse', function () {
    return function (items) {
        if (!items) {
            return [];
        }
        return items.slice().reverse();
    };
});

// app.run(function($ionicPlatform,$location ) {
    
//       $ionicPlatform.ready(function() {
    
    
//         if(window.cordova && window.cordova.plugins.Keyboard) {
//           cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//         }
//         if(window.StatusBar) {
//           StatusBar.styleDefault();
//         }
//         var appDevice={};
//         appDevice["device_id"] = device.uuid;
//         appDevice["model"] = device.model;
//         appDevice["os_type"] = device.platform;
//         appDevice["os_version"] = device.version;
    
    
//         //   $ionicPlatform.registerBackButtonAction(function (event) {
    
//         //       if ($location.path() == '/categories') {
    
//         //       } else{
//         //           navigator.app.backHistory();
//         //       }
//         //   }, 100);
    
//       });
//     });


        



    app.config(['$routeProvider','$ionicAppProvider',
    function ($routeProvider, $ionicAppProvider) {
        
        // Identify app
        $ionicAppProvider.identify({
            // The App ID (from apps.ionic.io) for the server
            app_id: 'YOUR_APP_ID',
            // The public API key all services will use for this app
            api_key: 'YOUR_PUBLIC_KEY',
            // Set the app to use development pushes
            dev_push: true
        });

        $routeProvider.
        when('/', {
            title: 'Attendance',
            templateUrl: 'templates/login.html',
            controller: 'login',
            resolve: {
                'langData': function (lang) {
                    // langData will also be injectable in your controller,
                    // if you don't want this you could create a new promise with the $q service
                    return lang.promise;
                }
            }
        })
        . when('/indexpage', {
            title: 'Attendance',
            templateUrl: 'templates/index1.html',
            controller: 'showNews',
            cache: true,
            resolve: {
                'langData': function (lang) {
                    // langData will also be injectable in your controller,
                    // if you don't want this you could create a new promise with the $q service
                    return lang.promise;
                }
            }
        })
        .when('/loginnew', {
            title: 'LoginNew',
            templateUrl: 'templates/loginnew.html'
        })
        //delaylist
        .when('/delaylist', {
            title: 'DelayList',
            templateUrl: 'templates/delaylistclass.html'
        })
        .when('/attendancedelay', {
            title: 'Attendance',
            templateUrl: 'templates/attend-sheet-delay.html',
            controller: 'attendancedelayController'
        })
        .when('/classes', {
            title: 'Classes',
            templateUrl: 'templates/classes.html'
        })
        .when('/mailCompose', {
            title: 'Create Mail',
            templateUrl: 'templates/template-mail-create.html',
            controller: 'mailCompose'
        })
        .when('/mailList', {
            title: 'List Mail',
            templateUrl: 'templates/template-mail-listing.html',
            controller: 'mailList'
        }).when('/attendance', {
            title: 'Attendance',
            templateUrl: 'templates/attend-sheet.html',
            controller: 'attendanceController'
        }).when('/student', {
            title: 'Details',
            templateUrl: 'templates/student-view.html'
//            controller: 'studentView'
        }).when('/callenderView', {
            title: 'Calender',
            templateUrl: 'templates/callender.html',
            controller: 'callender'
        })
        .when('/addClass', {
            title: 'Add new Class',
            templateUrl: 'templates/add-class.html',
            controller: 'addClasses'
        })
        .when('/user', {
            title: 'User info',
            templateUrl: 'templates/user.html',
            controller: 'user'
        })
        .when('/children', {
            title: 'Children list',
            templateUrl: 'templates/children-list.html'
        })
         .when('/news', {
            title: 'News Tab',
            templateUrl: 'templates/newstab.html'
        })
        .when('/about', {
            title: 'News Tab',
            templateUrl: 'templates/about.html',
            controller: 'showAboutus'
        })
        .when('/contact', {
            title: 'News Tab',
            templateUrl: 'templates/contact.html',
            controller:'contactCtrl'
        })
         .when('/plan', {
            title: 'Plan Tab',
            templateUrl: 'templates/plantab.html',
            controller: 'showPlans'
            // ,
            // resolve: {
            //     'langData': function (lang) {
            //         // langData will also be injectable in your controller,
            //         // if you don't want this you could create a new promise with the $q service
            //         return lang.promise;
            //     }
            // }
        })
        .when('/newplan', {
            title: 'Plan Tab',
            templateUrl: 'templates/newplan.html',
            controller: 'showPlans'
            // ,
            // resolve: {
            //     'langData': function (lang) {
            //         // langData will also be injectable in your controller,
            //         // if you don't want this you could create a new promise with the $q service
            //         return lang.promise;
            //     }
            // }
        })
        .when('/register', {
            title: 'Register',
            templateUrl: 'templates/register.html',
            controller: 'registerwithbuy'
            // ,
            // resolve: {
            //     'langData': function (lang) {
            //         // langData will also be injectable in your controller,
            //         // if you don't want this you could create a new promise with the $q service
            //         return lang.promise;
            //     }
            // }
        })
        .when('/registernew', {
            title: 'Register',
            templateUrl: 'templates/registernew.html',
            controller: 'registerwithbuy'
            // ,
            // resolve: {
            //     'langData': function (lang) {
            //         // langData will also be injectable in your controller,
            //         // if you don't want this you could create a new promise with the $q service
            //         return lang.promise;
            //     }
            // }
        })
        .when('/imagefull', {
            title: 'Register',
            templateUrl: 'templates/imagetaptest.html',
            controller: 'FullscreenImageCtrl'
            
        })
        .when('/showimagefull', {
            title: 'Register',
            templateUrl: 'templates/showimage.html',
            controller: 'showNews'
            
        })
        .when('/news', {
            title: 'About Us',
            templateUrl: 'templates/newstab.html',
            controller: 'showAboutus'
            // ,
            // resolve: {
            //     'langData': function (lang) {
            //         // langData will also be injectable in your controller,
            //         // if you don't want this you could create a new promise with the $q service
            //         return lang.promise;
            //     }
            // }
        })
        .when('/welcome', {
            title: 'Welcome Tab',
            templateUrl: 'templates/welcometab.html',
            controller: 'showNews',
            resolve: {
                'langData': function (lang) {
                    // langData will also be injectable in your controller,
                    // if you don't want this you could create a new promise with the $q service
                    return lang.promise;
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);
app.run(['$location', '$rootScope', function ($location, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $rootScope.title = current.$$route.title;
        });
    }]);

