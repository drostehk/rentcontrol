$(function() {
	$('.dropdown').dropdown({ onChange: function(value){console.log(value);}});
});

$(document).ready(function() {

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

    //Form validation
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

});

/*    var cat;
    if (document.getElementById("flatsize").value < 40) {
    	cat = "A";
    	document.getElementById("flatcat").value = cat;
    } else if (document.getElementById("flatsize").value >= 40 || document.getElementById("flatsize").value <= 69.9) {
    	cat = "B" ;
    } else if (document.getElementById("flatsize").value >= 70 || document.getElementById("flatsize").value <= 99.9) {
    	cat ="C";
    } else if (document.getElementById("flatsize").value >= 100 || document.getElementById("flatsize").value <= 159.9) {
    	cat = "D";
    } else {
    	cat = "E";
    }
    
    document.getElementById("flatcat").value = cat;*/