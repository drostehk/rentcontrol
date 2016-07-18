var ilocation, iperiod, iduedate, iincrease;
var iclass = "B";
var c = ["A", "B", "C", "D", "E"];
var chiNum = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', 
            '十四','十五','十六','十七','十八','十九','二十','二十一','二十二','二十三','二十四',
            '二十五','二十六','二十七','二十八','二十九','三十','三十一'];


$(document).ready(function() {

    //Email template modal
    $('#share').click(function() {
        $('.ui.modal').modal('show');
    });

    //Location drop-down menu
    $('.dropdown').dropdown('set selected', 'Hong Kong Island');

    $('#mainForm').keypress(function(event) { 
        var keycode = (event.keyCode ? event.keyCode : event.which); 
        if (keycode == 13) {
            event.preventDefault();
            makeGraph();
        }
    });

    //Flat Size slider

var cats = ['<431','431-752','753-1075','1076-1722','≥1723']

$('#flatsize').val(1);
 
$(".slider")

    .slider({ 
        min: 0, 
        max: cats.length-1, 
        value: 1,
        animate: 200
    })
                    
    .slider("pips", {
        rest: "label",
        labels: cats
    })
                    
    .on('slidechange', function(e,ui) {
        $('#flatsize').val(ui.value);      
    });

    //Due Date datepicker
	var now = new Date();
	if (now.getMonth() == 12) {
	    var current = new Date(now.getFullYear() + 1, 0, 1);
	} else {
	    var current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
	}

	document.getElementById("duedate").value = current.toLocaleString();
    document.getElementById("year").innerHTML = chiNum[(current.getFullYear().toString()[2]) - 1] + chiNum[(current.getFullYear().toString()[3]) - 1];
    document.getElementById("month").innerHTML = chiNum[current.getMonth() - 1];
    document.getElementById("day").innerHTML = chiNum[current.getDate() - 1];

	$('input[name="duedate"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true
       });

    //Rental Increase form validation
    $('#mainForm')
        .form({
            on: 'blur',
            fields: {
                rentIncrease: {
                    identifier  : 'rentIncrease',
                    optional: true,
                    rules: [
                        {
                            type    : 'integer[1..100]',
                            prompt  : '請輸入一個整數'
                        }
                    ]
                }
            }
        });

    //Generate plotly.js graph
    makeGraph();
    document.getElementById("genGraph").onclick = function() {makeGraph();};
    function makeGraph() {

    ilocation = $('#loc').val();
    iperiod = $('#period').val();
    iduedate = $('#duedate').val();
    iincrease = $('#rentIncrease').val();
    var startDate = moment(iduedate).subtract(iperiod,'months').calendar().toLocaleString();
    var startRange = moment(startDate).subtract(3,'months').calendar().toLocaleString();
    var s = new Date(startDate);
    var sr = new Date(startRange);
    var d = new Date(iduedate);
    var srr = sr.getFullYear() + '-' + (sr.getMonth() + 1);
    var ss = s.getFullYear() + '-' + (s.getMonth() + 1);
    var dd = d.getFullYear() + '-' + (d.getMonth() + 1);

    GRAPH = document.getElementById('graph');

    function makeplot() {
        Plotly.d3.csv('https://raw.githubusercontent.com/drostehk/rentcontrol/master/avgRent.csv', function(data){ processData(data) });
    }

    function processData(allRows) {
        var x = [], y = [], sRent, dRent;

        iclass = c[parseFloat($('#flatsize').val())]

        var yy = iclass + '_' + ilocation;

        if ($('#loc').val() == "Hong Kong Island") {
            ilocation = '香港島';
        } else if ($('#loc').val() == "Kowloon") {
            ilocation = '九龍';
        } else if ($('#loc').val() == "New Territories") {
            ilocation = '新界';
        }

        function findI() {
            for (var i = 0; i < allRows.length; i++) {
                row = allRows[i];

                var dateString = [row['year'],row['month']];
                var yymm = dateString.join("-");

                if (yymm == ss) {
                    return i;
                }
            }
        };

        var i = findI();
        i = parseFloat(i);
        iperiod = parseFloat(iperiod);

        var ceiling = i + iperiod + 1;
        if (ceiling > allRows.length) {
            ceiling = allRows.length;
        }

        for (var j = i - 3; j < ceiling; j++) {

            row = allRows[j];

            var dateString = [row['year'].toString(),row['month'].toString()];
            var yymm = dateString.join("-");

            x.push(yymm);
            y.push(parseFloat((row[yy]/10.764).toFixed(2)));

            if (yymm == ss) {
                sRent = (row[yy]/10.764).toFixed(2);
            }

            if (yymm == dd) {
                dRent = (row[yy]/10.764).toFixed(2);
            } else {
                dRent = (allRows[208][yy]/10.764).toFixed(2);
            }
        }

        makePlotly(x,y,sRent,dRent);

    }   

    function makePlotly(x,y,sRent,dRent) {
        var avg = {
            x: x,
            y: y,
            name: '市價',
            mode: 'lines',
            line: {
                color: 'rgb(78,81,201)',
                width: 1
            }
        };

        var actualChange = {
            x: [ss,dd],
            y: [sRent,dRent],
            name: '市價',
            mode: 'lines+markers',
            fill: 'tonexty',
            line: {
                color: 'rgb(71,230,194)',
                width: 1.5
            }
        };

        var pIncrease = (sRent*(iincrease/100 + 1)).toFixed(2);
        var proposedIncrease = {
            x: [ss,dd],
            y: [sRent, pIncrease],
            name: '建議整調',
            mode: 'lines+markers',
            fill: 'tonexty',
            line: {
                color: 'rgb(31,118,180)',
                width: 1.5
            }
        };

        var stable = {
            x: [ss,dd],
            y: [sRent,sRent],
            name: '原有租金',
            mode: 'lines+markers',
            fill: 'tonexty',
            line: {
                color: 'rgb(255,197,30)',
                width: 1.5               
            }
        };

        var change, changeamt;
        if (dRent > sRent) {
            changeamt = ((dRent - sRent)/sRent*100).toFixed(2);
            document.getElementById('change').innerHTML = '上升' + changeamt + '個百分比';
            changeamt = '實際上升 ' + changeamt + '%';
        } else if (dRent < sRent) {
            changeamt = Math.abs((dRent - sRent)/sRent*100).toFixed(2);
            document.getElementById('change').innerHTML = '下降' + changeamt + '個百分比';
            changeamt = '實際下降 ' + changeamt + '%';
        } else {
            changeamt ="沒有變更";
            document.getElementById('change').innerHTML = '沒有變更';
        }
        dRent = parseFloat(dRent);
        var label_change = {
            x: [Date.UTC(d.getFullYear(),d.getMonth()-3,1)],
            y: [Math.max.apply(Math, y) - 1],
            text: [changeamt.toString()],
            mode:'text',
            textfont: {
                family: 'Source Sans Pro',
                size: 16,
                color: '#FF5B1E'
            }
        };

        var label_changeIncrease = {
            x: [Date.UTC(d.getFullYear(),d.getMonth()-4,25),Date.UTC(d.getFullYear(),d.getMonth()-4,25)],
            y: [parseFloat(pIncrease) + 0.5 ,Math.min.apply(Math, y)+0.5],
            text: ['建議增加 ' + iincrease + '%', changeamt],
            mode:'text',
            textfont: {
                family: 'Source Sans Pro',
                size: 16,
                color: '#FF5B1E'
            }
        };

        var data;
        if (iincrease != "") {
            data = [avg, actualChange,proposedIncrease,label_changeIncrease, stable];
        } else {
            data = [avg, actualChange,label_change];
        }

        var sq = '2';
        var layout = {
        title: '私人住宅平均租金 - ' + ilocation + ' (類別: ' + iclass + ')',
        xaxis: {
            title: 'Date',
            range: [Date.UTC(sr.getFullYear(),sr.getMonth(),sr.getDate()),Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())]
        },
        yaxis: {
            title: '$/平方呎'
        },
        showlegend: false,
        annotations: [{
            x: ss,
            y: sRent,
            xref: 'x',
            yref: 'y',
            text: '租約開始',
            textfont: {
                family: 'Source Sans Pro',
                size: 15,
                color: '#1f77b4'
            },
            showarrow: true,
            arrowhead: 5,
            ax: 0,
            ay: 40
        }, {
            x: dd,
            y: dRent,
            xref: 'x',
            yref: 'y',
            text: '租約結束',
            textfont: {
                family: 'Source Sans Pro',
                size: 15,
                color: '#1f77b4'
            },
            showarrow: true,
            arrowhead: 5,
            ax: 0,
            ay: 40  
        }]
    };

    var d3 = Plotly.d3;
    var img_jpg = d3.select('#jpg-export');

        Plotly.newPlot(GRAPH, data, layout)

        //Export graph as JPG
        .then(function(gd) {
            Plotly.toImage(gd,{format:'jpeg',height:450,width:653})
                .then(
                    function(url)
                    {
                        img_jpg.attr("src", url);
                        return Plotly.toImage(gd,
                        {
                            format:'jpeg', height: 400, width:400
                        });
                    })
        });
    };

    makeplot();


    /*-----Territory-wide indices-----
    function makeplot() {
        Plotly.d3.csv('https://raw.githubusercontent.com/drostehk/rentcontrol/master/his_data_3csv.csv', function(data){ processData(data) });
    }

    function processData(allRows) {
        var x = [], y= [];

        for (var i = 0; i<allRows.length; i++) {
            row = allRows[i];

            var date = [row['Year'].toString(),row['Month'].toString()];
            var yym = date.join("-");

            x.push(yym);
            y.push(row['B']);
        }
        makePlotly(x,y);
    }

        var layout = {
        title: 'Private Domestic Rental Index (Territory-Wide)',
        //'Private Domestic Rental Index - Average ' + ilocation + ' Rate for Class ' + iclass,
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Private Domestic Rental Index (Base Year = 1999)'
        }
    };

    function makePlotly(x,y) {
        var trace1 = [{
            x: x,
            y: y,
            fill: 'tonexty'
        }];

        Plotly.newPlot(GRAPH, trace1, layout);
    };

    makeplot(); */

    }; //makegraph function

});