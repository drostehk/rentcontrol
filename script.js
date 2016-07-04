// $('.ui.dropdown')
//   .dropdown()
// ;

//   $('#range-3').range({
//     min: 0,
//     max: 5,
//     start: 1,
//     onChange: function(value) {
//       /**var cats = ['< 40','40 - 69.9','70-99.9','100 - 159.9','> 160']**/
//       var cats = ['A', 'B', 'C', 'D', 'E']
//       $('#display-3').html(cats[value]);
//     }
//   });

//   $('.menu .item')
//   .tab()
// ;


// $('#duedate').calendar();

// var now = new Date();
// if (now.getMonth() == 11) {
//     var current = new Date(now.getFullYear() + 1, 0, 1);
// } else {
//     var current = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
// }

// document.getElementsByTagName("INPUT")[0].value = current;

$(function(){
  $('.dropdown').dropdown({ onChange: function(value, text){console.log(value, text);}});

});