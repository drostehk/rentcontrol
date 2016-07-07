var ilocation, iclass, iperiod, iduedate, iincrease;

$(document).ready(function() {

    //Location
    $('.dropdown').dropdown('set selected', 'Hong Kong Island');

    //Due Date datepicker
	var now = new Date();
	if (now.getMonth() == 12) {
	    var current = new Date(now.getFullYear() + 1, 0, 1);
	} else {
	    var current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
	}

	document.getElementById("duedate").value = current.toLocaleString();

	$('input[name="duedate"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true
       });

    //Flat Size
    $('#flatsize').on('change keydown paste input', function() {
        var size = parseFloat(document.getElementById("flatsize").value);
        if(size < 40) {
            document.getElementById("class").value = "A";
        } else if (size >= 40 && size < 70) {
            document.getElementById("class").value = "B";
        } else if (size >= 70 && size < 100) {
            document.getElementById("class").value = "C";
        } else if (size >= 100 && size < 160) {
            document.getElementById("class").value = "D";
        } else if (size >= 160) {
            document.getElementById("class").value = "E";
        } else {
            document.getElementById("class").value = "B";
        }
    });


    //Rental Increase form validation (?)
    $('#mainForm')
    	.form({
    		on: 'blur',
    		fields: {
    			integer: {
    				identifier	: 'integer',
    				optional: true,
    				rules: [
						{
							type	: 'integer[1..100]',
							prompt	: 'Please enter an integer value'
						}
    				]
    			}
    		}
    	});

    document.getElementById("genGraph").onclick = function() {makeGraph();};

    function makeGraph() {

    ilocation = $('#loc').val();
    iclass = $('#class').val();
    iperiod = $('#period').val();
    iduedate = $('#duedate').val();
    var startDate = moment(iduedate).subtract(iperiod,'months').calendar().toLocaleString();
    var startRange = moment(startDate).subtract(6,'months').calendar().toLocaleString();
    var s = new Date(startDate);
    var sr = new Date(startRange);
    var d = new Date(iduedate);
    var ss = s.getFullYear() + '-' + (s.getMonth() + 1);
    var srr = sr.getFullYear() + '-' + (sr.getMonth() + 1);
    var dd = d.getFullYear() + '-' + (d.getMonth() + 1);

    console.log(ss, srr, dd);

    GRAPH = document.getElementById('graph');

    function makeplot() {
        Plotly.d3.csv('https://raw.githubusercontent.com/drostehk/rentcontrol/master/avgRent.csv', function(data){ processData(data) });
    }

    function processData(allRows) {
        var x = [], y = [], sRent, dRent;
        var yy = iclass + '_' + ilocation;

        for (var i = 0; i<allRows.length; i++) {
            row = allRows[i];

            var dateString = [row['year'].toString(),row['month'].toString()];
            var yymm = dateString.join("-");
            
            x.push(yymm);
            y.push(row[yy]);

            if (yymm == ss) {
                sRent = row[yy];
            }

            if (yymm == dd) {
                dRent = row[yy];
            } else {
                dRent = allRows[208][yy];
            }
        }

        makePlotly(x,y,sRent,dRent);

    }   

    function makePlotly(x,y,sRent,dRent) {
        var avg = {
            x: x,
            y: y,
            line: {
                color: 'rgb(8,74,164)',
                width: 1
            }
        };

        var actualIncrease = {
            x: [ss,dd],
            y: [sRent,dRent],
            mode: 'lines',
            fill: 'tonexty',
            line: {
                color: 'rgb(71,230,194)',
                width: 2
            }
        };

        var data = [avg, actualIncrease];

        var sq = '2';

        var layout = {
        title: 'Average Private Domestic Rents - '  + ilocation + ' Class ' + iclass,
        xaxis: {
            title: 'Date',
        },
        yaxis: {
            title: '$/m' + sq.sup(2)
        },
        showlegend: false
    };

        Plotly.newPlot(GRAPH, data, layout);
    };

    makeplot();


    /*-----Territory-wide indices-----*/
    // function makeplot() {
    //     Plotly.d3.csv('https://raw.githubusercontent.com/drostehk/rentcontrol/master/his_data_3csv.csv', function(data){ processData(data) });
    // }

    // function processData(allRows) {
    //     var x = [], y= [];

    //     for (var i = 0; i<allRows.length; i++) {
    //         row = allRows[i];

    //         var date = [row['Year'].toString(),row['Month'].toString()];
    //         var yym = date.join("-");

    //         x.push(yym);
    //         y.push(row['B']);
    //     }
    //     makePlotly(x,y);
    // }

    //     var layout = {
    //     title: 'Private Domestic Rental Index (Territory-Wide)',
    //     //'Private Domestic Rental Index - Average ' + ilocation + ' Rate for Class ' + iclass,
    //     xaxis: {
    //         title: 'Date'
    //     },
    //     yaxis: {
    //         title: 'Private Domestic Rental Index (Base Year = 1999)'
    //     }
    // };

    // function makePlotly(x,y) {
    //     var trace1 = [{
    //         x: x,
    //         y: y,
    //         fill: 'tonexty'
    //     }];

    //     Plotly.newPlot(GRAPH, trace1, layout);
    // };

    // makeplot();

    }; //makegraph function

});