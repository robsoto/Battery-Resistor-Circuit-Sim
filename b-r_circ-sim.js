//MAGIC NUMBERS EVERYWHERE!
//TO DO: GET RID OF MAGIC NUMBERS!
var circ = Raphael(0,0,900,1500); //circuit canvas
var graph = Raphael(900,0,200,200); //graph canvas

//circuit skeleton
var battWidth = 300;
var battLeft = 290;
var battRight = 610;
var battery = circ.rect(300,350,300,125);
var resistor = circ.rect(300,135,300,90); 
var chargeRadius = 10;
var resColor = 'rgb(255,155,0)';
var rgb = resColor.match(/\d+/g); //regex, returns array of values of r, g, b
var innerPath = circ.path('M600,380H800V205H600V225H300V205H100V380H300');
var outerPath = circ.path('M600,430H850V155H600V135H300V155H50V430H300');
var chargePath = circ.path('M600,405H825V180H75V405H600');
var rightSide = 825;
var leftSide = 75;
var top = 180;
var bottom = 405;
var pathLen = chargePath.getTotalLength();
var numCharges = pathLen / ((chargeRadius*2) + 20);
var subpath = circ.path(chargePath.getSubpath(675, 975)); //subpath within resistor
var chargeAnimFactor = 25;
var coreAnimFactor = 100;
subpath.attr({opacity:0});
chargePath.attr({opacity:0}); 
resistor.attr({fill:resColor})

//creating "charges" with attribute .dist
charges = circ.set(); 
function charge() {
	this.dist = charges.length * (chargeRadius * 2 + 20);
	
	if (this.dist > pathLen) { //keep dist in range (0,pathlen]
		this.dist = this.dist % pathLen;	
	}
	
	var chargePos = chargePath.getPointAtLength(this.dist);
	var c = circ.circle(chargePos.x, chargePos.y, chargeRadius);
	charges.push(c);
}

//array of charge dists
dist = [];
for (i = 0; i < numCharges; i++) {
	var c = new charge();
	dist[dist.length] = c.dist;
}

charges.attr({fill:'yellow'});

//resistor core
var coreDist = 37;
corePos = subpath.getPointAtLength(coreDist);
var cores = circ.set()

for (i = 0; i < 4; i++) {
	cores.push(circ.circle(corePos.x, corePos.y, 10))
	coreDist += 75;
	corePos = subpath.getPointAtLength(coreDist);
}

//generates random number in range (from, to)
function random(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
}

var coreBound = 10; //range of motion for cores

//create attributes initcx, initcy
for(i = 0; i < cores.length; i++) {
	var core = cores[i];
	core.data('initcx', core.attr('cx'));
	core.data('initcy', core.attr('cy'));
}

function animateCores(){
	for (i = 0; i < cores.length; i++) {
		var core = cores[i];
		if (current == 0) {
			core.animate({cx:core.data('initcx'), cy:core.data('initcy')}, coreAnimFactor);
		}
		else {
			var newcx = core.data('initcx') + random(-coreBound, coreBound);
			var newcy = core.data('initcy') + random(-coreBound, coreBound);
			core.animate({cx:newcx, cy:newcy}, coreAnimFactor);	
		}
	}
}

cores.attr({fill:'blue'});

//resistor "heating" as color change
//reddens resistor if current is too high
/*function heat(elem) {
	if (current > 10 && rgb[1] > 0) { //testing value
		rgb[1]--;
		var rgbStr = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
		elem.attr({fill:rgbStr});
	}
	else if (rgb[1] > 0 && rgb[1] <= 155) {
		rgb[1] += 5;
		var rgbStr = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
		elem.attr({fill:rgbStr});
	}
}*/

//Creating voltage and resistance sliders
var resistance = new slider(circ, 100, 50, 300, 50, 1, 50, 'Resistance');
var voltage = new slider(circ, 500, 50, 300, 50, 0, 12, 'Voltage');

var current = voltage.val / resistance.val;
var moveFactor = current / 1.5; 

//Recalculating current on a time interval for now
//TO DO: REVISIT TO GET THIS WORKING ON CLICK/DRAG
setInterval(function() {
	current = voltage.val / resistance.val;
	moveFactor = current;
	cores.attr({r:(resistance.val / 8) + 10});
	if (current != 0) {
		chargeAnimFactor = 100 / current;
	}
}, 100);

//CHANGE TO TAKE IN SET OF CHARGES AND MOVE THEM SIMULTANEOUSLY
//animation of moving charges
function animateCharges() {
	var nullAnim = Raphael.animation({});
	var nextPos = chargePath.getPointAtLength(dist[0]+moveFactor);
	if ((dist[0]+moveFactor) > pathLen) {
		var d = (dist[0]+moveFactor) % pathLen;
		nextPos = chargePath.getPointAtLength(d);	
	}
	
	if (nextPos.x > battLeft && nextPos.x < battRight) {
		charges[0].attr({opacity:0});	
	}
	else { 
		charges[0].attr({opacity:1});	
	}
	
	dist[0] += moveFactor;
	charges[0].animate({cx:nextPos.x, cy:nextPos.y}, chargeAnimFactor);
	
	for (i = 1; i < numCharges; i++) {
		var nextPos = chargePath.getPointAtLength(dist[i]+moveFactor);
		if (dist[i]+moveFactor > pathLen) {
			var d = (dist[i]+moveFactor) % pathLen;
			nextPos = chargePath.getPointAtLength(d);	
		}
		var charge = charges[i];
		dist[i] += moveFactor;
		charge.animateWith(charges[i-1], nullAnim, {cx:nextPos.x, cy:nextPos.y}, chargeAnimFactor);
		
		if (nextPos.x > battLeft && nextPos.x < battRight) {
			charges[i].attr({opacity:0});	
		}
		else { 
			charges[i].attr({opacity:1});	
		}
	}
}

//I-V graph
function drawGraph() {
	var slope = 1 / resistance.val;
	var yInt = 0;
	//console.log('draw')
	drawLine(graph, slope, yInt);
}

//TO DO: MODIFY SO THAT INTERVAL IS BASED ON CURRENT
function runBattery() {
	setInterval(animateCharges, chargeAnimFactor);
	setInterval(animateCores, coreAnimFactor);
	setInterval(drawGraph, 100);
}

//test run battery
runBattery();

