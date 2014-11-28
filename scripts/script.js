$('#newEvent').on('click', addNewEvent);

$('#toggleEditBtn').on('click', function(){
    if ($('section a').css('display') == 'none'){
        $('section a').css("display", "inline-block");
    } else {
        $('section a').css("display", "none");
    }
});


$("#changePageBg").on('click', function(){
    var newBg =  prompt("Enter URL for the background:");



    if (newBg == "" || newBg.length < 15){
        newBg = ('#D5D5D5');
        $('body').css("background", newBg);
    } else {
        newBg = "url('" + newBg +  '\') no-repeat center center fixed';
    }

    $.ajax({
        method: 'PUT',
        async:false,
        url: 'https://api.parse.com/1/classes/Page/Z4Ud4Beygu',
        data: JSON.stringify(
            {
                'background': newBg
            }
        ),
        contentType: "application/json",
        success: function(){
            changeBackground(newBg)
        },
        error: databaseError
    });
});

$('#toggleEditBtn').hide();

function changeBackground(path){
    $("body")
        .css("background", path)
        .css("-webkit-background-size", "cover")
        .css("-moz-background-size", "cover")
        .css("-o-background-size", "cover")
        .css("background-size", "cover");
}

function getBackground(){
    $.ajax({
        method: "GET",
        url: encodeURI("https://api.parse.com/1/classes/Page/Z4Ud4Beygu"),
        success: function(data){
                changeBackground(data.background);
        },
        error: databaseError
    });
}

function eventTemplate(item){
    res = "" +
        "<section id='" + item.objectId +"' class='event' style='background:" + (item.important == true ? "#FFF6BB!important": (item.color + '!important' )) + "'>" +
        "<h3 class='title'>" +  item.title + "</h3>" +
        "<textarea class='eventContent' id='content" + item.objectId + "'>" + item.content + "</textarea>" +
        "<a href=\"javascript:editEvent('" + item.objectId + "');\">Save</a> " +
        "<a href=\"javascript:deleteEvent('" + item.objectId + "');\">Delete</a> ";

        if (item.important){
            res +="<a href=\"javascript:toggleImportant('" + item.objectId + "', false);\">Mark as Normal</a>";
        }else {
            res +="<a href=\"javascript:toggleImportant('" + item.objectId + "', true);\">Mark as Important</a>";
        }

    res += " <a href=\"javascript:pickColor('" + item.objectId + "');\">Pick Color<input type='color' style='position:absolute;left:-9999px;top:-9999px;' id='colorPick-" + item.objectId + "'/></a>";

    return res + "</section>";
}

$.ajaxSetup({
    headers: {
        "X-Parse-Application-Id": "PtzDrKxtdGLm82CmTEFLwb3oJlXz3Hmz8yHeNvWL",
        "X-Parse-REST-API-Key": "gxnzM4rj26M52zGI5Xl7IjLDYssIl8yhcOg9h05r"
    }
});

getBackground();

function getEvents(order){
    $('#loader-gif').fadeIn();
    $.ajax({
        method: "GET",
        url: encodeURI("https://api.parse.com/1/classes/Event?order=" + ((order == "" || order == null || typeof order == "object") ? "-createdAt" : order)),
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

function pickColor(id){
    $("#colorPick-" + id).click();
    $("#colorPick-" + id).on('change', function(){
        $.ajax({
            method: 'PUT',
            url: 'https://api.parse.com/1/classes/Event/' + id,
            data: JSON.stringify(
                {
                    'color':$("#colorPick-" + id).val()
                }
            ),
            contentType: "application/json",
            success: getEvents,
            error: databaseError
        });
    });

}

function showEvents(data){
    $('#events').html("");

    data.results.forEach(function(item){
        $('#events').append(eventTemplate(item));
        $('#content' + item.objectId).on("click", function(){
            $('#toggleEditBtn').click();
        });
        $('#content' + item.objectId).parent().on("mouseleave", function(){
            if ($('a').css('display') != 'none')
                $('#toggleEditBtn').click();
            $('#content' + item.objectId).blur();
        });

    });
    $('#events').fadeIn(700);
    $('#loader-gif').fadeOut();


    $("textarea").on('mouseenter', function(){
        this.style.height = "1px";
        this.style.height = (25+this.scrollHeight)+"px";
    });

    $("#newContent").on('mouseenter', function() {
        this.style.height = "190px";
    });
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
    alert('Database connection error');
    console.log(err);
}



getEvents();