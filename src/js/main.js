$(function() {
    try {
        Html5emantichecker.initialize($("#errorsContainer"), $("#infosContainer"));
    }
    catch(error) {
        alert(error);
    }
    
    $("#htmlCode").focus(function() {
        $(this).text("");
    });
    
    $("#btnCheck").click(function() {
        Html5emantichecker.check($("#htmlCode").val());
    });
});