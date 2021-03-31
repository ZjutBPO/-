//获取Canvas对象(画布)
var C = document.getElementById("SubwayLine");
var Cwidth = 1400,Cheight = 700;

let ctx = C.getContext("2d");

function drawPath(path) {
    
    //如果颜色需要变更，必须先开始新的路径，否则全部的线颜色由最后一次设置的颜色决定
    ctx.strokeStyle = "#000000";
    for (let i = 1; i < path.length; i++) {
        ctx.beginPath();
        ctx.moveTo(path[i-1].x, path[i-1].y);
        ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(path[i].x, path[i].y, 3, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}

path = [];

stx = 10;
sty = Cheight / 2

for (let i = 0;i<25;i++){
    path[i] = {"x":stx,"y":sty};
    stx += Cwidth / 25;
}
// 67 68 69 70 71 72 73 74 5 75 76 77 46 45 44 43 42 41 40 39 38 37 36 35 34

console.log(path);
drawPath(path)