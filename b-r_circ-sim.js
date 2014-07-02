//MAGIC NUMBERS EVERYWHERE!
//TO DO: GET RID OF MAGIC NUMBERS!
var R = Raphael(0,0,1500,1500); //Raphael canvas

//circuit skeleton
var battWidth = 300;
var battLeft = 290;
var battRight = 600;
var battery = R.rect(300,350,300,125);
var resistor = R.rect(275,135,350,90); 
var chargeRadius = 10;
var resColor = 'rgb(255,155,0)';
var rgb = resColor.match(/\d+/g);
//console.log(rgbStr);
var innerPath = R.path('M600,380H800V205H625V225H275V205H100V380H300');
var outerPath = R.path('M600,430H850V155H625V135H275V155H50V430H300');
var chargePath = R.path('M600,405H825V180H75V405H600');
var rightSide = 825;
var leftSide = 75;
var top = 180;
var bottom = 405;
var pathLen = chargePath.getTotalLength();
var numCharges = pathLen / ((chargeRadius*2) + 20);
var subpath = R.path(chargePath.getSubpath(650, 1000)); //subpath within resistor
var moveFactor = 2;
subpath.attr({opacity:0});
chargePath.attr({opacity:0}); 
resistor.attr({fill:resColor})

//creating "charges"
//var chargeDist = 10;
//var chargePos = chargePath.getPointAtLength(chargeDist);
//circles = R.set();
charges = R.set(); 
function charge() {
	//chargeDist += chargeRadius + 30;
	//var counter = 0;
	this.dist = charges.length * (chargeRadius * 2 + 20);
	if (this.dist >= pathLen) {
		this.dist = this.dist % pathLen;	
	}
	var chargePos = chargePath.getPointAtLength(this.dist);
	var c = R.circle(chargePos.x, chargePos.y, chargeRadius);
	charges.push(c);
	//counter++;
}

dist = [];
for (i = 0; i < numCharges; i++) {
	//charges.push(R.circle(chargePos.x, chargePos.y, 10));
	//chargeDist += chargeRadius + 30;
	var c = new charge();
	dist[dist.length] = c.dist;
	//circles.push(c);
	console.log(c.dist);	
	//chargePos = chargePath.getPointAtLength(c.dist);
}
console.log(dist)
//console.log(circles[0])
//console.log(charges[0].dist);
//charges[0].dist++;
//console.log(charges[0].dist)

charges.attr({fill:'yellow'});
//console.log(parseInt(charges[2].attr('cx')));

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
function heat(elem) {
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
}

//Creating voltage and resistance sliders
var resistance = new slider(R, 900, 100, 400, 50, 1, 100, 'Resistance');
var voltage = new slider(R, 900, 200, 400, 50, 0, 12, 'Voltage');

var current = voltage.val / resistance.val;

//Recalculating current on a time interval for now
//TO DO: REVISIT TO GET THIS WORKING ON CLICK/DRAG
setInterval(function() {
	current = voltage.val / resistance.val;
	//console.log(current);
}, 100);

//CHANGE TO TAKE IN SET OF CHARGES AND MOVE THEM SIMULTANEOUSLY
//animation of moving charges
function animateCharges() {
	var nullAnim = Raphael.animation({});
	//var curX = parseInt(charges[0].attr('cx'));
	var nextPos = chargePath.getPointAtLength(dist[0]+moveFactor);
	//var curY = parseInt(charges[0].attr('cy'));
	//console.log(curX + ', ' + curY);
	if ((dist[0]+moveFactor) > pathLen) {
		var d = (dist[0]+moveFactor) % pathLen;
		nextPos = chargePath.getPointAtLength(d);	
	}
	
	if (nextPos.x > battLeft && nextPos.x < battRight && nextPos.y == bottom) {
		charges[0].attr({opacity:0});	
	}
	else { 
		charges[0].attr({opacity:1});	
	}
	
	dist[0] += moveFactor;
	charges[0].animate({cx:nextPos.x, cy:nextPos.y}, moveFactor);
	
	for (i = 1; i < numCharges; i++) {
		var nextPos = chargePath.getPointAtLength(dist[i]+moveFactor);
		if ((dist[i]+moveFactor) > pathLen) {
			var d = (dist[i]+moveFactor) % pathLen;
			nextPos = chargePath.getPointAtLength(d);	
		}
		var charge = charges[i];
		dist[i] += moveFactor;
		charge.animateWith(charges[i-1], nullAnim, {cx:nextPos.x, cy:nextPos.y}, moveFactor);
		
		if (nextPos.x > battLeft && nextPos.x < battRight && nextPos.y == bottom) {
			charges[i].attr({opacity:0});	
		}
		else { 
			charges[i].attr({opacity:1});	
		}
	}
	/*if (curX < rightSide && curY == bottom) {
		//charges[0].dist++;
		dist[0] += moveFactor;
		charges[0].animate({cx:nextPos.x}, moveFactor);
	}
	else if (curX >= rightSide && curY > top) {
		charges[0].animate({cy:nextPos.y}, moveFactor);
	}
	else if (curX > leftSide && curY == top) {
		charges[0].animate({cx:curX-1}, moveFactor);	
	}
	else if (curX == leftSide && curY > bottom) {
		charges[0].animate({cy:curY+1}, moveFactor);	
	}*/
	
	/*for (i = 1; i < charges.length; i++) {
		var charge = charges[i];
		var curX = parseInt(charge.attr('cx'));
		var curY = parseInt(charge.attr('cy'));
		var nullAnim = Raphael.animation({});
		
		if (curX < rightSide && curY == bottom) {
			charge.animateWith(charges[i-1], nullAnim, {cx:curX+1}, 1);
		}
		else if (curX == rightSide && curY > top) {
			charge.animateWith(charges[i-1], nullAnim, {cy:curY-1}, 1);
		}
		else if (curX > leftSide && curY == top) {
			charge.animateWith(charges[i-1], nullAnim, {cx:curX-1}, 1);	
		}
		else if (curX == leftSide && curY > bottom) {
			charge.animateWith(charges[i-1], nullAnim, {cy:curY+1}, 1);	
		}
	} */

		/*for (i in charges) {
			var charge = charges[i];
			console.log(charge);
			//remove elem and exit function when path is completed
			if (charge.dist >= (pathLen - batteryWidth)) { 
				charge.attr({opacity:0}); 
			}
			var pos = chargePath.getPointAtLength(charge.dist);
			charge.node.setAttribute('cx', pos.x);  
			charge.node.setAttribute('cy', pos.y);

			charge.dist++;
		} */
}
				
/*function animateCharges() {
	setInterval(function() {
		for (i in charges) {
			var charge = charges[i];
			
			//remove elem and exit function when path is completed
			if (charge.dist >= chargePath.getTotalLength()) { 
				charge.remove();
				return; 
			}
		var pos = chargePath.getPointAtLength(dist);
		elem.attr({cx: pos.x, cy: pos.y});  

		dist++; 
	}, 100); //NOT WORKING
}*/

//TO DO: MODIFY SO THAT INTERVAL IS BASED ON CURRENT
function runBattery() {
	//var newCharge = R.circle(600,405,10); 
	//var dist = 0; //dist starts at 0 for each new element
	setInterval(function() {
		//newCharge = R.circle(600,405,10); 
		//console.log(current)
		//animateCharge(newCharge, dist);
		animateCharges();
		console.log(current);
		heat(resistor);
		//console.log(resistor.attr('fill')) 
	}, 10);
}

//test run battery
runBattery();

