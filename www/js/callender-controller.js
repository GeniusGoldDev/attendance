/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
app.controller('callender',['$scope','$rootScope','$location','localFactory','store','lang','lang_code',
    function($scope,$rootScope,$location,localFactory,store,lang,lang_code  ){
        var time = 300;
        $scope.showNav= function() {
            $(".popup-overlay").fadeIn(time);
        };

        $rootScope.hideOptions= function() {
            $(".popup-overlay").fadeOut(time);
        };
    $scope.holidays = store.getData('holidays');
//    alert($scope.holidays);
    $scope.lc ='en';
        if(lang_code == 'arb'){
            $scope.lc = 'ar';
        }
    $scope.pageClass = 'page-about';
    $scope.lang = lang.getLang();
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.changeTo = 'Hungarian';

    /* Change View */
    $scope.changeView = function(view,calendar) {
      calendar.fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if(calendar){
        calendar.fullCalendar('render');
      }
    };
    $scope.alertOnDayClick = function(date, jsEvent, view) {
        var formattedDate = new Date(date);
        var d = formattedDate.getDate();
        var m =  formattedDate.getMonth();
        m += 1;  // JavaScript months are 0-11
        var y = formattedDate.getFullYear();
        var formated_date = y+'-'+m+'-'+d;
        var formated_date2 = d+'/'+m+'/'+y;
        
        d = (String(d).length == 1) ? '0'+d : d; 
        m = (String(m).length == 1) ? '0'+m : m; 
         
        var day = y+'-'+m+'-'+d;
        
        
        if($scope.holidays.indexOf(day) >= 0){
            localFactory.toast($scope.lang.holiday);
            return false;
        }
        
        
        store.addData('date',formated_date);
        return $scope.sheet(formated_date2);
    };
    $scope.checkDate = function (inputDateText) {
        //get today's date in string
        var todayDate = new Date();
        //need to add one to get current month as it is start with 0
        var todayMonth = todayDate.getMonth() + 1;
        var todayDay = todayDate.getDate();
        var todayYear = todayDate.getFullYear();
        var todayDateText = todayDay + "/" + todayMonth + "/" + todayYear;
       
//       //get date input from SharePoint DateTime Control
//        var inputDateText = document.getElementById('<%= datepicker.ClientID %>' + '_' + '<%= datepicker.ID %>' + 'Date').value;

        var split = inputDateText.split('/');
        var date = new Date(split[2], split[1] - 1, split[0]); //Y M D 
        var inputToDate = date.getTime();
        
        var split = todayDateText.split('/');
        var date = new Date(split[2], split[1] - 1, split[0]); //Y M D 
        var todayToDate = date.getTime();

       //compare dates
        if (inputToDate > todayToDate) {return 1}
        else if (inputToDate < todayToDate) { return 2;}
        else {return 3}
    };
     $scope.sheet = function(selectDateText){
        var course_id = store.getData('course_id'); 
        var date = store.getData('date');
        var chekDate = $scope.checkDate(selectDateText);
        
        
//        if( chekDate == 1 && user_type == '2'){
//            localFactory.toast('You can choose only current/past date.');
//            return false;
//        }
//        else
        if( chekDate == 1 ){
            localFactory.toast($scope.lang.future_date_not);
            return false;
        }
        store.addData('date_type',chekDate);
        localFactory.load();
        
        var cid_delay = store.getData('course_id');
        var uno = store.getData('user').user_no;
        var sessid= localFactory.getLocalItem('session_id');
        var response = localFactory.post('getStudents/'+course_id,{ 
            date : date,
            user_no    : store.getData('user').user_no,
            session_id : localFactory.getLocalItem('session_id')
        });
        response.success(function(data){
            localFactory.unload();
            if( !data.session ){
                alert(data.msg);
                localFactory.flushLocalItems();
                $location.path('login');
                return false;
            }
            var semnos = (data.totalsems) ? data.totalsems : 7;
            
            store.addData('course_id',course_id);
            store.addData('course_sems',semnos);
            store.addData('students',data.students);
            store.addData('last_cem',data.last_cem);
            store.addData('semteacher',data.semteacher);
            store.addData('editables',data.editables);
            store.addData('modification',data.modification);
            store.addData('savedData',data.saved);
            store.addData('editedData',data.edited);
            $location.path('attendance');
        });

    };
    $scope.dayOnRender = function( date, cell ) { 
        var formattedDate = new Date(date);
        var d = formattedDate.getDate();
        var m =  formattedDate.getMonth();
        m += 1;  // JavaScript months are 0-11
        var y = formattedDate.getFullYear();
        d = (String(d).length == 1) ? '0'+d : d;  
        m = (String(m).length == 1) ? '0'+m : m;  
        var day = y+'-'+m+'-'+d;
        
        if($scope.holidays.indexOf(day) >= 0){
            $(cell).css('border-width', '1px').css('border-style', 'solid').css('border-color', 'red');
        }
//        if($scope.length > 0 ){
//            for(var i=0;i<dates.length;i++){
//                if(date.format() == dates[i].date){
//                    $(cell).css('background-color', 'red');
//                    break;
//                }
//            }
//        }
    };
    
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        lang: $scope.lc,
        dayClick: $scope.alertOnDayClick ,
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender,
        dayRender : $scope.dayOnRender
      }
    };


    
//    $scope.changeLang = function() {
//      if($scope.changeTo === 'Hungarian'){
//        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
//        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
//        $scope.changeTo= 'English';
//      } else {
//        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//        $scope.changeTo = 'Hungarian';
//      }
//    };
}]);

