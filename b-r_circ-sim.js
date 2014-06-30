//MAGIC NUMBERS EVERYWHERE!
//TO DO: GET RID OF MAGIC NUMBERS!
var R = Raphael(0,0,1500,1500); //Raphael canvas

//circuit skeleton
var battery = R.rect(300,350,300,125);
var resistor = R.rect(275,135,350,90); 
var chargeRadius = 10;
var resColor = 'rgb(255,155,0)';
var rgb = resColor.match(/\d+/g);
console.log(rgb)
var innerPath = R.path('M600,380H800V205H625V225H275V205H100V380H300');
var outerPath = R.path('M600,430H850V155H625V135H275V155H50V430H300');
var chargePath = R.path('M600,405H825V180H75V405H300');
var pathLen = chargePath.getTotalLength();
var numCharges = pathLen / ((chargeRadius*2) + 20);
var subpath = R.path(chargePath.getSubpath(650, 1000)); //subpath within resistor
subpath.attr({opacity:0});
chargePath.attr({opacity:0}); 
resistor.attr({fill:resColor})

//creating "charges"
var chargeDist = 10;
var chargePos = chargePath.getPointAtLength(chargeDist);
charges = R.set();

for (i = 0; i < numCharges; i++) {
	charges.push(R.circle(chargePos.x, chargePos.y, 10));
	chargeDist += chargeRadius + 30;
	chargePos = chargePath.getPointAtLength(chargeDist);
}

charges.attr({fill:'yellow'});

//resistor core
var coreDist = 25;
corePos = subpath.getPointAtLength(coreDist);
var cores = R.set()

for (i = 0; i < 5; i++) {
	cores.push(R.circle(corePos.x, corePos.y, 15));
	coreDist += 75;
	corePos = subpath.getPointAtLength(coreDist);
}

cores.attr({fill:'blue'});

//resistor heating
function heatUp(elem) {
	if (current > 10 && rgb[1] > 0) { //testing value
		rgb[1]--;
		elem.attr({fill:rgb});
	}
}

//Creating voltage and resistance sliders
var resistance = new slider(R, 900, 100, 400, 50, 0.2, 10, 'Resistance');
var voltage = new slider(R, 900, 200, 400, 50, -12, 12, 'Voltage');
var current = voltage.val / resistance.val;

//Recalculating current on a time interval for now
//TO DO: REVISIT TO GET THIS WORKING ON CLICK/DRAG
setInterval(function() {
	current = voltage.val / resistance.val;
	//console.log(current);
}, 100);

//CHANGE TO TAKE IN SET OF CHARGES AND MOVE THEM SIMULTANEOUSLY
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
	}, 100/current); //NOT WORKING
}

//TO DO: MODIFY SO THAT INTERVAL IS BASED ON CURRENT
function runBattery() {
	var newCharge = R.circle(600,405,10); 
	var dist = 0; //dist starts at 0 for each new element
	setInterval(function() {
		//newCharge = R.circle(600,405,10); 
		console.log(current)
		//animateCharge(newCharge, dist);
		heatUp(resistor);
		console.log(resistor.attr('fill')) 
		//fill is updating properly, but only displaying gray
		//issue is string and int parsing
	}, 500);
}

//test run battery
runBattery();

