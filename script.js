var ilocation, iperiod, iduedate, iincrease;
var iclass = "B";

$(document).ready(function() {

    //Location drop-down menu
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

        var size = parseFloat(document.getElementById("flatsize").value);
        size = size/10.764;
        if(size < 40) {
            iclass = "A";
        } else if (size >= 40 && size < 70) {
            iclass = "B";
        } else if (size >= 70 && size < 100) {
            iclass = "C";
        } else if (size >= 100 && size < 160) {
            iclass = "D";
        } else if (size >= 160) {
            iclass = "E";
        } else {
            iclass = "B";
        };

        var yy = iclass + '_' + ilocation;

        function findI() {
            for (var i = 0; i < allRows.length; i++) {
                row = allRows[i];

                var dateString = [row['year'].toString(),row['month'].toString()];
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
            name: 'Rent',
            line: {
                color: 'rgb(78,81,201)',
                width: 1
            }
        };

        var actualChange = {
            x: [ss,dd],
            y: [sRent,dRent],
            name: 'Actual Change',
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
            name: 'Proposed Increase',
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
            name: 'Original',
            mode: 'lines+mrkers',
            fill: 'tonexty',
            line: {
                color: 'rgb(255,197,30)',
                width: 1.5               
            }
        };

        var change, changeamt;
        if (dRent > sRent) {
            change = "% increase";
            changeamt = (dRent - sRent)/sRent*100;
            changeamt = changeamt.toFixed(2);
        } else if (dRent < sRent) {
            change = "% decrease";
            changeamt = (dRent - sRent)/sRent*100;
            changeamt = Math.abs(changeamt).toFixed(2);
        } else {
            change = "No change";
            changeamt ="";
        }
        dRent = parseFloat(dRent);
        var label_change = {
            x: [Date.UTC(d.getFullYear(),d.getMonth()-3,1)],
            y: [Math.max.apply(Math, y) - 2],
            text: [changeamt.toString() + change],
            mode:'text',
            textfont: {
                family: 'Source Sans Pro',
                size: 16,
                color: '#FF5B1E'
            }
        };

        //console.log(Math.min.apply(Math,y), Math.max.apply(Math,y))
        var label_changeIncrease = {
            x: [Date.UTC(d.getFullYear(),d.getMonth()-3,1),Date.UTC(d.getFullYear(),d.getMonth()-3,1)],
            y: [parseFloat(pIncrease) + 0.5 ,Math.min.apply(Math, y)+0.5],
            text: ['Proposed ' + iincrease + '% increase', 'Actual ' + changeamt.toString() + change],
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
        title: 'Average Private Domestic Rents - '  + ilocation + ' Class ' + iclass,
        xaxis: {
            title: 'Date',
            range: [Date.UTC(sr.getFullYear(),sr.getMonth(),sr.getDate()),Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())]
        },
        yaxis: {
            title: 'HK$/ft' + sq.sup(2)
        },
        showlegend: false,
        annotations: [{
            x: ss,
            y: sRent,
            xref: 'x',
            yref: 'y',
            text: 'Start Contract',
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
            text: 'End Contract',
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