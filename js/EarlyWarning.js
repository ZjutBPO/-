$("#ShowHeatMap").click(function () {
    $(".heatmap_circle").toggle();
})

$("#MessageNum").text(100);

var page_index = 1,page_size,message_count,page_num;

$.ajax({
    url:"/json/Message.json",
    type:"GET",
    dataType:"json",
    success:function () {
        page_size = $(".message_part").height() / $(".alert-message").outerHeight(true);
        $("#MainBody .left_part .message_part").html("");
        
        message_count = 25;
        page_num = Math.ceil(message_count / page_size);
        page_index = 1;

        let list_obj = $("#turn-page-list");
        list_obj.html("");
        for (let i = 1;i<=page_num;i++){
            if (i == page_index) list_obj.append('<li class = "active"><span>' + i + '</span></li>');
            else list_obj.append('<li onclick="turn_to_page(' + i + ')"><span>' + i + '</span></li>');
        }
    }
})

function turn_to_page(e) {
    $("#MainBody .left_part .message_part").html("");
    for (let i = 0;i<page_size;i++){
        let message_type = "alert-success"
        let str = 
        '<div class="alert ' + message_type + ' alert-dismissable alert-message" id = "message' + i + '">\
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>\
            <p>sta15预警解除</p>\
        </div>';
        $("#MainBody .left_part .message_part").append(str);
    }
}