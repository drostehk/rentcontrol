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

});
