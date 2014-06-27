var R = Raphael(0,0,1000,1000);
var battery = R.rect(300,350,300,125);
var charge = R.circle(600,405,10);
/*var cathodeX = battery.attr('x');
var cathodeY = battery.attr('y') + (battery.attr('height') / 2);
var anodeX = battery.attr('x') + battery.attr('width');
var anodeY = cathodeY;*/
var innerPath = R.path('M600,380H800V205H625V225H275V205H100V380H300');
var outerPath = R.path('M600,430H850V155H625V135H275V155H50V430H300');
var chargePath = R.path('M600,405H825V180H75V405H300');

chargePath.attr({opacity:0}); 

/*var animation = setInterval(function() {
		charge = R.circle(600,405,10);
		animateCharge(charge);
	}, 500); //change interval to be based on current
*/

var animation = setInterval(function(){
	//console.log('go');
	animateCharge(charge)},20);
var counter = 0;
function animateCharge(elem) {
	if (chargePath.getTotalLength() <= counter) { 
        clearInterval(animation);
    }
    var pos = chargePath.getPointAtLength(counter);  
    elem.attr({cx: pos.x, cy: pos.y});  
    
    counter++; 
}