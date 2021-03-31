(function () {
    let option = {
        color: ['#c23531', '#E98F6F', '#6AB0B8'],
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: ['55%', '70%'],
                data: [
                    { value: 1048, name: '出站闸机1' },
                    { value: 735, name: '出站闸机2' },
                    { value: 580, name: '进站闸机2' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }
    let myChart = echarts.init(document.getElementById("chart"));
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });

    let myChart1 = echarts.init(document.getElementById("chart1"));
    myChart1.setOption(option);
    window.addEventListener("resize", function () {
        myChart1.resize();
    });
})();

(function () {
    let option = {
        xAxis: {
            data: ['4:00', '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [0.3, 0.5, 0.2, 0.6, 1.0, 1.3, 1.5, 0.6, 0.4, 0.6, 0.8],
            type: 'line',
            smooth: true
        }],
        grid: [{
            x: 30,
            y: 30,
            x2: 30,
            y2: 30
        }]
    }
    let myChart = echarts.init(document.getElementById("chart3"));
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
})();

// this.timer = setInterval(() => {
//     _this.date = new Date() // 修改数据date
//   }, 1000)

// var date = new Date(time)
// var year = date.getFullYear()
// /* 在日期格式中，月份是从0开始的，因此要加0
// * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
// * */
// var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
// var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
// // 拼接
// return year + '-' + month + '-' + day

// var date = new Date(time)
// /* 在日期格式中，月份是从0开始的，因此要加0
// * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
// * */
// var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
// var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
// var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
// // 拼接
// return hours + ':' + minutes + ':' + seconds