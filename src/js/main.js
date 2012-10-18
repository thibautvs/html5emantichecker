/*
 * Html5emantichecker
 * version 0.6
 * author: Thibaut Van Spaandonck (Urge2code)
 * http://www.urge2code.com
 * http://github.com/Urge2code/Html5emantichecker
 * Licensed under the MIT license.
*/
$(function() {
    try {
        Html5emantichecker.initialize($("#errorsContainer"), $("#infosContainer"));
    }
    catch (error) {
        alert(error);
    }
    
    $("#htmlCode").focus(function() {
        $(this).text("");
    });
    
    $("#btnCheck").click(function() {
        try {
            Html5emantichecker.check($("#htmlCode").val());
        }
        catch (error) {
            alert(error);
        }
    });
});