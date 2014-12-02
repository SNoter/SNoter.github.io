$('#newEvent').on('click', addNewEvent);

$('#toggleEditBtn').on('click', function(){
    if ($('section a').css('display') == 'none'){
        $('section a').css("display", "inline-block");
    } else {
        $('section a').css("display", "none");
    }
}).hide();

$("#changeThemeBtn").on("click", function(){
    if (localStorage.getItem("theme") == 'dark'){
        localStorage.setItem("theme", "light");
        switchThemes();
    } else {
        localStorage.setItem("theme", "dark");
        switchThemes();
    }
});

function switchThemes(){
    if (localStorage.getItem("theme") == 'dark'){
        loadDarkTheme();
    } else{
        loadLightTheme();
    }
}

function loadLightTheme(){
    $("header").css("background", "#FFF").css("box-shadow", "0 1px 2px #aaa");
    $("body").css("background", "#D5D5D5");
    $(".event").css("cssText", "background:#FFFFFF !important").css("box-shadow", "0 1px 2px #aaa");
    $(".event .title").css("color", "#61A516");
    $(".event textarea").css("color", "#000000");
    $("#newTitle").css("background", "#FFFFFF").css("box-shadow", "0 1px 2px #aaa");
    $("#newContent").css("background", "#FFFFFF").css("box-shadow", "0 1px 2px #aaa");
    $("#newEvent").css("background", "#FFFFFF").css("box-shadow", "0 1px 2px #aaa");
    localStorage.setItem("theme", "light");
}

function loadDarkTheme(){
    $("header").css("background", "#1D1D1D").css("box-shadow", "0 1px 2px #000");
    $("body").css("background", "#252525");
    $(".event").css("cssText", "background:#333333 !important").css("box-shadow", "0 1px 2px #000");
    $(".event .title").css("color", "#22AADD");
    $(".event textarea").css("color", "#FFFFFF");
    $("#newTitle").css("background", "#333333").css("box-shadow", "0 1px 2px #000");
    $("#newContent").css("background", "#333333").css("box-shadow", "0 1px 2px #000");
    $("#newEvent").css("background", "#333333").css("box-shadow", "0 1px 2px #000");
    localStorage.setItem("theme", "dark");
}


switchThemes();

function eventTemplate(item){
    res = "" +
        "<section id='" + item.objectId +"' class='event''>" +
        "<h3 class='title'>" +  item.title + "</h3>" +
        "<textarea spellcheck='false' class='eventContent' id='content" + item.objectId + "'>" + item.content + "</textarea>" +
        "<a href=\"javascript:editEvent('" + item.objectId + "');\">Save</a> " +
        "<a href=\"javascript:deleteEvent('" + item.objectId + "');\">Delete</a> ";

        if (item.important){
            res +="<a href=\"javascript:toggleImportant('" + item.objectId + "', false);\">Mark as Normal</a>";
        }else {
            res +="<a href=\"javascript:toggleImportant('" + item.objectId + "', true);\">Mark as Important</a>";
        }

    return res + "</section>";
}

$.ajaxSetup({
    headers: {
        "X-Parse-Application-Id": "PtzDrKxtdGLm82CmTEFLwb3oJlXz3Hmz8yHeNvWL",
        "X-Parse-REST-API-Key": "gxnzM4rj26M52zGI5Xl7IjLDYssIl8yhcOg9h05r",
        "X-Parse-Session-Token": getCookie("sessionToken")
    }
});

function logUserIn(){

    $("#logIn").fadeIn();

    $(".close").on("click", function(){
        $("#logIn").fadeOut();
    });

    $("#logInButton").on("click", function(){
        var username = $("#username").val();
        var password = $("#password").val();
        logIn(username, password);
    });
}

function logOut(){
    document.cookie = "sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("loggedUserUsername");
    localStorage.removeItem("loggedUserId");
}

function logIn(username, pass){
    logOut();

    $.ajax({
        method: "GET",
        url: 'https://api.parse.com/1/login?username=' + username + '&password=' + pass,
        contentType: "application/json",
        data: null,
        success: function(data){
            console.log(JSON.stringify(data));
            document.cookie = "sessionToken=" + data.sessionToken;
            localStorage.setItem("loggedUserId", data.objectId);
            localStorage.setItem("loggedUserUsername", data.username);
            $("#logIn").fadeOut();

            $.ajaxSetup({
                headers: {
                    "X-Parse-Application-Id": "PtzDrKxtdGLm82CmTEFLwb3oJlXz3Hmz8yHeNvWL",
                    "X-Parse-REST-API-Key": "gxnzM4rj26M52zGI5Xl7IjLDYssIl8yhcOg9h05r",
                    "X-Parse-Session-Token": getCookie("sessionToken")
                }
            });
            $("#logInBtn").text(data.username);
        },
        error: function(err){
            alert("Invalid login credentials.");
            $("#logInBtn").text("Log in");
            console.log(err);
        }
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}

function getEvents(order){
    $('#loader-gif').fadeIn();
    $.ajax({
        method: "GET",
        url: encodeURI("https://api.parse.com/1/classes/Event?order=" + ((order == "" || order == null || typeof order == "object") ? "-createdAt" : order)),
        success: showEvents,
        error: databaseError
    });

    if (typeof localStorage.getItem('loggedUserId') != 'object'){
        $("#logInBtn").text(localStorage.getItem('loggedUserUsername'));
        console.log(localStorage.getItem('loggedUserUsername'))
    } else {
        $("#logInBtn").text("log in");
    }
}

function filterEvents(){
    $('#loader-gif').fadeIn();
    $.ajax({
        method: "GET",
        url: encodeURI("https://api.parse.com/1/classes/Event?where={\"important\":true}"),
        success: showEvents,
        error: databaseError
    });
}

function addNewEvent(){

    $('#loader-gif').fadeIn();
    var title = $('#newTitle').val();
    var content = $('#newContent').val();

    $('#newTitle').val("");
    $('#newContent').val("");

    if (!content || !title){
        alert('No valid data');
        return;
    }
    content = content.replace(/(?:\r\n|\r|\n)/g, '<br />');

    $.ajax({
        method: "POST",
        url: "https://api.parse.com/1/classes/Event",
        data: JSON.stringify(
            {
                'title': title,
                'content': content,
                'important':false,
                'color':"#FFFFFF"
            }
        ),
        success: getEvents,
        contentType: "application/json",
        error: databaseError
    });
}

function showEvents(data){
    $('#events').html("");

    data.results.forEach(function(item){
        $('#events').append(eventTemplate(item));
    });

    $('#events').fadeIn(700);
    $('#loader-gif').fadeOut();

    $("textarea").on("click", function(){
        return false;
    });

    $("#newContent").on('mouseenter', function() {
        this.style.height = "190px";
    });

    $(".event").on("click", function(){
        if($(this).css("max-height") == "500px"){
            $(this).css("max-height", "55px");
            if ($('body').innerWidth() > 1155)
                $(this).css("width", "100%").css("margin-left", "0px");
        } else{
            $(this).css("max-height", "500px");
            $(this).find("textarea").css("height", "1px");
            $(this).find("textarea").css("height", (25+($(this).find("textarea").prop('scrollHeight')))+"px");

            if ($('body').innerWidth() > 1155)
                $(this).css("width", "151%").css("margin-left", "-150px");
        }
    });

    switchThemes();
}

function editEvent(id){
    var content = $("#content" + id).val();

    if (!content){
        alert('No valid data');
        return;
    }

    $.ajax({
        method: 'PUT',
        url: 'https://api.parse.com/1/classes/Event/' + id,
        data: JSON.stringify(
            {
                'content':content
            }
        ),
        contentType: "application/json",
        success: getEvents,
        error: databaseError
    });
}

function toggleImportant(id, value){
    $.ajax({
        method: 'PUT',
        url: 'https://api.parse.com/1/classes/Event/' + id,
        data: JSON.stringify(
            {
                'important':value
            }
        ),
        contentType: "application/json",
        success: getEvents,
        error: databaseError
    });
}

function deleteEvent(id){
    var sure = confirm("Are you sure that you want to delete the note?");
    if (sure){
        $.ajax({
            method: 'DELETE',
            url: 'https://api.parse.com/1/classes/Event/' + id,
            success: getEvents,
            error: databaseError
        });
    }
}

function databaseError(err){
    if (err.status  == 403){
        alert("You don't have the permissions to create/edit/delete a note");
    } else {
        alert('Database connection error');
    }
    console.log(err);
}



getEvents();