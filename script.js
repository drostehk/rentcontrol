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

    GRAPH = document.getElementById('graph');

    function makeplot() {
        Plotly.d3.csv("https://raw.githubusercontent.com/drostehk/rentcontrol/master/his_data_3csv.csv", function(data){ processData(data) });
    };

    function processData(allRows) {
        console.log(allRows);
        var x = [], y= [], standard_deviation = [];

        for (var i = 0; i<allRows.length; i++) {
            row = allRows[i];
            x.push(row['Month']);
            y.push(row['B']);
        }
        makePlotly(x,y,standard_deviation);
    }

        var layout = {
        title: 'Private Domestic Rental Index - Average ' + ilocation + ' Rate for Class ' + iclass,
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Private Domestic Rental Index (Base Year = 1999)'
        }
    };

    function makePlotly(x,y,standard_deviation) {
        var traces = [{
            x: x,
            y: y
        }];

        Plotly.newPlot(GRAPH, traces, layout);
    };

    makeplot();



    //generate sample graph

        // var trace1 = {
        //   x: [1, 2, 3, 4],
        //   y: [10, 15, 13, 17],
        //   fill: 'tonexty',
        //   mode: 'lines',
        //   line: {
        //     color: 'rgb(255, 170, 0)',
        //     width: 1
        //   }
        // };

        // var data = [ trace1 ];

        // var layout = {
        //     title: 'Private Domestic Rental Index - Average ' + ilocation + ' Rate for Class ' + iclass,
        //     xaxis: {
        //         title: 'Date'
        //     },
        //     yaxis: {
        //         title: 'Private Domestic Rental Index (Base Year = 1999)'
        //     }
        // };

        // Plotly.newPlot(GRAPH,data,layout);

    }; //makegraph function

});