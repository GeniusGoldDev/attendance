/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

app.factory('PaypalService', ['$q', '$ionicPlatform', 'shopSettings', '$filter', '$timeout', function ($q, $ionicPlatform, shopSettings, $filter, $timeout) {
    var init_defer;

    var service = {
    initPaymentUI:      initPaymentUI,
    createPayment:      createPayment,
    configuration:      configuration,
    onPayPalMobileInit: onPayPalMobileInit,
    makePayment:        makePayment
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
   var config = new PayPalConfiguration({merchantName: shopSettings.payPalShopName, merchantPrivacyPolicyURL: shopSettings.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: shopSettings.payPalMerchantUserAgreementURL});
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
   // total = $filter('number')(total, 2);
    alert(total);
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
app.factory("resultsFactory", ['$http','$timeout','$q',function($http, $timeout, $q) { 
    var resultsFactory = {};  
    
    function _all(){
      var d = $q.defer();
        $timeout(function(){
              d.resolve([{txt:'one'},{txt:'two'},{txt:'three'}]);
       }, 2000); 
    
      return d.promise;       
    }
    
    resultsFactory.all = _all;
    return resultsFactory;
  }]);
app.factory("localFactory", ['$http', 'webservice', 'lang', 'lang_code','$timeout','$q', function ($http, webservice, lang, lang_code,$timeout, $q) {
        var localFactory = {};
        localFactory.lang = lang.getLang();
        localFactory.loadOptions = {
            label: localFactory.lang.loading
        };
        try {
            wizSpinner.create(localFactory.loadOptions);
        } catch (error) {
            console.log('Error', error.message);
        }
        localFactory.isMobile = true;

        localFactory.flushables = [];
//    localFactory.flushables.push('device_id');
//    localFactory.flushables.push('os_type');

        localFactory.post = function (slug, dataPost) {
            dataPost.lang_code = lang_code;
            localFactory.checkInternet();
            var http = $http({
                method: "POST",
                url: webservice.getService(slug),
                data: $.param(dataPost),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
//.success(function(data){
//   return data;
//})
            http.error(function (data, status, headers, config) {
                localFactory.unload();
                console.debug("Error Status : ", status);
                console.debug("Error Headers : ", headers);
                console.debug("Error Data : ", data);
                console.debug("Error Config : ", config);
            });
            return http;
        };
        localFactory.get = function (slug, dataGet) {
            localFactory.checkInternet();
            var http = $http({
                method: "GET",
                url: webservice.getService(slug),
                data: $.param(dataGet),
            });
//.success(function(data){
//return data;
// });
            http.error(function (data, status, headers, config) {
                localFactory.unload();
                console.debug("Error Status : ", status);
            });
            return http;
        };
        localFactory.getJson = function (url) {
            return $http.get(url);
        };
        localFactory.load = function () {
            try {
                wizSpinner.show(localFactory.loadOptions);
            } catch (error) {
                console.log('Error', error.message);
            }
        };
        localFactory.unload = function () {
            try {
                wizSpinner.hide();
            } catch (error) {
                console.log('Error', error.message);
            }
        };
        localFactory.setLocalItem = function (key, value, removable) {
            localFactory.flushables[key] = removable;
            window.localStorage.setItem(key, value);
        };
        localFactory.setLocalItemJSON = function (key, value, removable) {
            localFactory.flushables[key] = removable;

            //var a = [];
            //a.push(JSON.parse(window.localStorage.getItem(key)));
            //localStorage.setItem('session', JSON.stringify(a));

            window.localStorage.setItem(key, JSON.stringify(value));
        };
        localFactory.getLocalItem = function (key) {
            return window.localStorage.getItem(key);
        };
        localFactory.getLocalItemJSON = function (key) {
            return JSON.parse(window.localStorage.getItem(key));
        };
        localFactory.flushLocalItem = function (key) {
            window.localStorage.removeItem(key);
        };
        localFactory.flushLocalItems = function () {
            for (fa in localFactory.flushables) {
                if (localFactory.flushables[fa]) {
                    localFactory.flushLocalItem(fa);
                    delete localFactory.flushables[fa];
                }
            }
        };
        localFactory.alert = function (message, callback, title, buttonName) {

            title = title || localFactory.lang.alert;
            buttonName = buttonName || localFactory.lang.ok;

            if (navigator.notification && navigator.notification.alert) {

                navigator.notification.alert(
                        message, // message
                        callback, // callback
                        title, // title
                        buttonName  // buttonName
                        );

            } else {
                alert(message);
                if (typeof callback !== "undefined") {
                    callback();
                }
            }

        };
        localFactory.confirm = function (message, callback, buttonLabels, title) {

//Set default values if not specified by the user.
            buttonLabels = buttonLabels || [localFactory.lang.ok, localFactory.lang.cancel];

            title = title || localFactory.lang.confirm;

//Use Cordova version of the confirm box if possible.
            if (navigator.notification && navigator.notification.confirm) {

                var _callback = function (index) {
                    if (callback) {
                        callback(index);
                    }
                };

                navigator.notification.confirm(
                        message, // message
                        _callback, // callback
                        title, // title
                        buttonLabels  // buttonName
                        );

//Default to the usual JS confirm method.
            } else {
                var a = confirm(message);
                if (a) {
                    callback(1);
                } else {
                    return false;
                }
//invoke(callback, confirm(message));
            }
        };
        localFactory.prompt = function (message, callback, dftext, title, buttonLabels) {

//Set default values if not specified by the user.
            buttonLabels = buttonLabels || [localFactory.lang.ok, localFactory.lang.cancel];

            title = title || localFactory.lang.action;
            dftext = dftext || localFactory.lang.write_something;

//Use Cordova version of the confirm box if possible.
            if (navigator.notification && navigator.notification.confirm) {

                var _callback = function (answer) {
                    if (answer.buttonIndex === 1) {
                        if (callback) {
                            callback(answer.input1);
                        }
// Ok
//                    var newcat = answer.input1;
                    }
                    else {
                        return false;
                    }
                };
                window.navigator.notification.prompt(
                        message, // message
                        _callback, // callback
                        title, //title
                        [localFactory.lang.ok, localFactory.lang.exit], // button titles
                        dftext// defaultText
                        );

//Default to the usual JS confirm method.
            } else {
                var a = prompt(message, dftext);
                if (a) {
                    callback(a);
                } else {
                    return false;
                }
//invoke(callback, confirm(message));
            }
        };
        localFactory.toast = function (message, duration, position) {
            position = position || 'bottom';
            duration = duration || 'short';
            try {
                window.plugins.toast.show(message, duration, position);
            } catch (e) {
                alert(message);
                console.log(e.message);
            }
        };
        localFactory.checkInternet = function () {
            try {
                if (navigator.connection) {
                    var networkState = navigator.connection.type;
                    if (networkState === Connection.NONE) {
                        localFactory.alert(localFactory.lang.no_internet);
                        return false;
                    }
                }
            } catch (e) {
                console.log(e.message);
            }
            return true;
        };
        localFactory.createModal = function (header, content) {

            var head = "<h3 class='modal-header'>" + (header || "Model Head") + "</h3>";
            var mcontent = "<div class='modal-content'>" + (content || "Model content") + "</div>";
//        var foot = "<div class='modal-footer'>"+(footer || "Model Head") + "</div>";
            var wrapper_start = "<div class='modal-wrapper' id='modal-wrapper'>";
            var wrapper_end = "</div>";
            var modal = wrapper_start + head + mcontent + wrapper_end;

            return modal;
        };
        return localFactory;
    }]);

