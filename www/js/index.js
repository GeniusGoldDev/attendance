jQuery(document).ready(function ($) {
    $("#filter").click(function (e) {

        // Set the effect type
        var effect = 'slow';

        // Set the options for the effect type chosen
        var options = {direction: 'right'};


        $('.pop-container').slideToggle(effect, options);
    });
    

});