//MAGIC NUMBERS EVERYWHERE!
//TO DO: GET RID OF MAGIC NUMBERS!
var R = Raphael(0,0,1500,1500); //Raphael canvas

//circuit skeleton
var battery = R.rect(300,350,300,125);
var resistor = R.rect(275,135,350,90); 
var innerPath = R.path('M600,380H800V205H625V225H275V205H100V380H300');
var outerPath = R.path('M600,430H850V155H625V135H275V155H50V430H300');
var chargePath = R.path('M600,405H825V180H75V405H300');
var subpath = R.path(chargePath.getSubpath(650, 1000)); //subpath within resistor
subpath.attr({opacity:0});
chargePath.attr({opacity:0}); 
resistor.attr({fill:'orange'})

//Creating voltage and resistance sliders
var resistance = new slider(R, 900, 100, 400, 50, 0.2, 10, 'Resistance');
var voltage = new slider(R, 900, 200, 400, 50, -12, 12, 'Voltage');
var current = voltage.val / resistance.val ;

//animation of moving charges
function animateCharge(elem, dist) {
	setInterval(function() {
		//remove elem and exit function when path is completed
		if (chargePath.getTotalLength() <= dist) { 
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
		current = voltage.val / resistance.val;
		console.log(current);
		newCharge = R.circle(600,405,10); 
		animateCharge(newCharge, dist);
	}, 500);
}

//test run battery
runBattery();
