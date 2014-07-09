var circuit = Raphael(0,0,465,450); //circuit canvas
var graph = Raphael(465,110,200,200); //graph canvas

//circuit skeleton and variable initialization
var battWidth = 300;
var battLeft = 80;
var battRight = 400;
var battery = circuit.rect(100,270,290,125);
var batteryLabel = circuit.rect(100,270,100,125);
var batteryNub = circuit.rect(90,310,10,30); 
var resistor = circuit.rect(90,60,300,90,20); 
var vMaxVal = 10;
var vMinVal = 0;
var graphHeight = 200;
var graphWidth = 200;
var currentDisp = circuit.text(240, 210, 'I = ' + roundTo3(0) + ' Amps');
var voltageDisp = circuit.text(150,280, roundTo3(0) + ' V');
var slopeDisp = graph.text(50,50,'');
var chargeRadius = 10;
var resColor = 'rgb(255,155,0)';
var rgb = resColor.match(/\d+/g); //regex, returns array of values of r, g, b
var innerRPath = circuit.path('M390,300H410V130H390');
var innerLPath = circuit.path('M90,130H70V300H100');
var outerRPath = circuit.path('M390,350H460V80H390');
var outerLPath = circuit.path('M90,80H20V350H100');
var chargePath = circuit.path('M390,325H435V105H45V325z');
var rightSide = 825;
var leftSide = 75;
var top = 105;
var bottom = 325;
var pathLen = chargePath.getTotalLength();
var numCharges = parseInt(pathLen / ((chargeRadius*2) + 20));
var subpath = circuit.path(chargePath.getSubpath(310, 610)); //charge subpath within resistor
var chargeAnimFactor = 25;
var coreAnimFactor = 80;
var coreBound = 0; //range of motion for cores
var vLine = graph.path('');
var slope = 0;
var yInt = 0;
var vLineX = 0;
var vLineY = graphHeight / 2;
var vLineH = 0;

//Creating voltage and resistance sliders
var resistance = new slider(circuit, 120, 20, 250, 30, 0.5, 10, 'Resistance');
var voltage = new slider(circuit, 120, 415, 250, 30, 0, 10, 'Voltage');
var current = voltage.val / resistance.val;

//creating "charges" with attribute .dist
charges = circuit.set(); 
function charge() {
	this.dist = charges.length * (chargeRadius * 2 + 21);
	
	if (this.dist > pathLen) { //keep dist in range (0,pathlen)
		this.dist = this.dist % pathLen;	
	}
	
	var chargePos = chargePath.getPointAtLength(this.dist);
	var c = circuit.circle(chargePos.x, chargePos.y, chargeRadius);
	charges.push(c);
}

//array of charge dists
dist = [];
for (i = 0; i < numCharges; i++) {
	var c = new charge();
	dist[dist.length] = c.dist;
}

//resistor core
var coreDist = 37;
corePos = subpath.getPointAtLength(coreDist);
var cores = circuit.set()

for (i = 0; i < 4; i++) {
	cores.push(circuit.circle(corePos.x, corePos.y, 10))
	coreDist += 75;
	corePos = subpath.getPointAtLength(coreDist);
}

//generates random number in range (from, to)
function random(from, to) {
       return Math.floor(Math.random() * (to - from + 1) + from);
}

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

//animation factor settings
var moveFactor = current; 
setInterval(function() {
	current = voltage.val / resistance.val;
	moveFactor = current;
	cores.attr({r:(10 + parseFloat(resistance.val))});
	if (current != 0) {
		if (voltage.val >= 0) {
			moveFactor += 1.5;
		}
		else {
			moveFactor -= 1.5;
		}
		chargeAnimFactor = 25 / current;
		coreBound = current / 2;
	}
}, 100);

function animateCharges() {
	if (voltage.val >= 0) {	
		/*animating initial charge in order to animate 
		following charges together with this one*/
		var nullAnim = Raphael.animation({});
		var nextPos = chargePath.getPointAtLength(dist[0]+moveFactor);
		var curPos = chargePath.getPointAtLength(dist[0]);
		if ((dist[0]+moveFactor) > pathLen) {
			var d = (dist[0]+moveFactor) % pathLen;
			nextPos = chargePath.getPointAtLength(d);	
		}
		if (dist[0] > pathLen) {
			var d = dist[0] % pathLen;
			curPos = chargePath.getPointAtLength(d);
		}

		if (current < 1) {
			if (curPos.x > battLeft && curPos.x < battRight) {
				charges[0].attr({opacity:0});	
			}
			else { 
				if (charges[0].attr('opacity') == 0) {
					charges[0].attr({opacity:1});	
				}
			}
		}
		else {
			if (nextPos.x > battLeft && nextPos.x < battRight) {
				charges[0].attr({opacity:0});	
			}
			else { 
				if (charges[0].attr('opacity') == 0) {
					charges[0].attr({opacity:1});	
				}
			}	
		}

		dist[0] += moveFactor;
		charges[0].animate({cx:nextPos.x, cy:nextPos.y}, chargeAnimFactor);

		for (i = 1; i < numCharges; i++) { //animate all other charges
			var nextPos = chargePath.getPointAtLength(dist[i]+moveFactor);
			var curPos = chargePath.getPointAtLength(dist[i]);
			if (dist[i]+moveFactor > pathLen) {
				var d = (dist[i]+moveFactor) % pathLen;
				nextPos = chargePath.getPointAtLength(d);	
			}
			if (dist[i] > pathLen) {
				var d = dist[i] % pathLen;
				curPos = chargePath.getPointAtLength(d);
			}
			
			var charge = charges[i];
			dist[i] += moveFactor;
			charge.animateWith(charges[i-1], nullAnim, {cx:nextPos.x, cy:nextPos.y}, chargeAnimFactor);
			
			if (current < 1) {
				if (curPos.x > battLeft && curPos.x < battRight) {
					charges[i].attr({opacity:0});	
				}
				else { 
					if (charges[i].attr('opacity') == 0) {
						charges[i].attr({opacity:1});	
					}
				}
			}
			else {
				if (nextPos.x > battLeft && nextPos.x < battRight) {
					charges[i].attr({opacity:0});	
				}
				else { 
					if (charges[i].attr('opacity') == 0) {
						charges[i].attr({opacity:1});	
					}
				}	
			}
		}
	}
	
	/*else if (voltage.val < 0) { //reverse animation for negative voltage
		var nullAnim = Raphael.animation({});
		var finalDist = dist[dist.length-1];
		var nextPos = chargePath.getPointAtLength(finalDist+moveFactor);
		if ((finalDist - moveFactor) < 0) {
			var d = pathLen + (finalDist + moveFactor);
			nextPos = chargePath.getPointAtLength(d);	
		}

		if (nextPos.x > battLeft && nextPos.x < battRight) {
			charges[numCharges-1].attr({opacity:0});	
		}
		else { 
			if (charges[numCharges-1].attr('opacity') == 0) {
				charges[numCharges-1].attr({opacity:1});
			}
		}

		finalDist += moveFactor;
		charges[numCharges-1].animate({cx:nextPos.x, cy:nextPos.y}, chargeAnimFactor);

		for (i = (numCharges - 2); i >= 0; i--) {
			var nextPos = chargePath.getPointAtLength(dist[i]-moveFactor);
			if (dist[i]-moveFactor < 0) {
				var d = pathLen + (dist[i] - moveFactor);
				nextPos = chargePath.getPointAtLength(d);	
			}
			var charge = charges[i];
			dist[i] -= moveFactor;
			charge.animateWith(charges[i+1], nullAnim, {cx:nextPos.x, cy:nextPos.y}, chargeAnimFactor);
			
			if (nextPos.x > battLeft && nextPos.x < battRight) {
				charges[i].attr({opacity:0});	
			}
			else { 
				charges[i].attr({opacity:1});	
			}
		}
	}*/
}

function updateDisplays() {
	slope = 1 / resistance.val;
	yInt = 0;
	drawLine(graph, slope, yInt);
	currentDisp.attr('text', 'I = ' + roundTo3(current) + ' Amps');
	voltageDisp.attr('text', roundTo3(voltage.val) + ' V');
	vLineX = (graphWidth / 2) + (voltage.val / vMaxVal * graphWidth / 2);
	vLineH = vLineY - ((vLineX - (graphWidth/2)) * slope);
	vLine.remove();
	vLine = graph.path('M' + vLineX + ',' + vLineY + 'V' + vLineH)
				 .attr('stroke-dasharray', '-');
	slopeDisp.attr({text:'Slope = ' + roundTo3(slope), fill:'red', 'font-family':'Courier', 'font-size':12});
}

//visual changes
graph.text(90, 10, 'I').attr({'font-family':'Courier', 'font-size':18, 'font-weight':'bold', 'fill':'blue'});
graph.text(190, 110, 'V').attr({'font-family':'Courier', 'font-size':18, 'font-weight':'bold', 'fill':'blue'});

charges.attr({fill:'yellow'});
cores.attr({fill:'red'});
battery.attr('fill', 'gray');
batteryLabel.attr('fill', 'black');
batteryNub.attr('fill', 'gray');
resistor.attr('fill', resColor);
currentDisp.attr({fill:'red', 'font-size':24, 'font-family':'Courier'});
voltageDisp.attr({fill:'rgb(64,128,255)', 'font-size':18, 'font-family':'Courier', 'font-weight':'bold'});
subpath.attr('opacity', 0);
chargePath.attr('opacity', 0); 

function runBattery() {
	setInterval(animateCharges, chargeAnimFactor);
	setInterval(animateCores, coreAnimFactor);
	setInterval(updateDisplays, 100);
}

//test run battery
$(document).ready(function() {
	runBattery();
});