var R = Raphael(0,0,1000,1000);
var battery = R.rect(300,350,300,125);
//var charge = R.circle(600,405,10);
/*var cathodeX = battery.attr('x');
var cathodeY = battery.attr('y') + (battery.attr('height') / 2);
var anodeX = battery.attr('x') + battery.attr('width');
var anodeY = cathodeY;*/
var innerPath = R.path('M600,380H800V205H625V225H275V205H100V380H300');
var outerPath = R.path('M600,430H850V155H625V135H275V155H50V430H300');
var chargePath = R.path('M600,405H825V180H75V405H300');

chargePath.attr({opacity:0}); 

function animateCharge(elem, dist) {
	setInterval(function() {
		if (chargePath.getTotalLength() <= dist) { //remove elem and exit function when path is completed
			elem.remove();
			return; 
		}
		var pos = chargePath.getPointAtLength(dist);  
		elem.attr({cx: pos.x, cy: pos.y});  

		dist++; 
	}, 5);
}

//TO DO: MODIFY SO THAT INTERVAL IS BASED ON CURRENT
function runBattery() {
	var newCharge = R.circle(600,405,10); 
	var dist = 0; //dist starts at 0 for each new element
	setInterval(function() {
		newCharge = R.circle(600,405,10); 
		animateCharge(newCharge, dist);
	}, 500);
}

runBattery();
