//This file is called in on every page, it carries out basic operations like loading the navbar and footer.
$(document).ready(function() {
    var atRoot = isAtRoot();
    var src = "";
    if(atRoot === false) {
        src = "../";
    }

    $("#footer-placeholder").load(src + "includes/footer.html");
    $("#navigation-placeholder").load(src + "includes/header.html",function() {
        if(atRoot === false) {
            changeHeaderSrc();
        }
    });
});

function isAtRoot() {
    if($("main.generator").length) {
        return true;
    } else {
        return false;
    }
}

function changeHeaderSrc() {
    //If main.generator is not present (which is ONLY present on index)
    //then change src in header
    $('a.menu-item').each(function(index, element) {
        var src = $(this).attr("href");
        $(this).attr("href", "../"+src);
    });

}
