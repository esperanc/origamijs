// Given line AB, returns point P rotated theta radians around the line.
// Rotation is right-handed around axis B-A.
// Taken from http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation
rotateAroundAxis = function (A,B,P,theta) {
	var a = A.x, b=A.y, c=A.z;
	var d = B.x, e=B.y, f=B.z;
	var u = d-a, v = e-b, w = f-c;
	var u2 = u*u, v2 = v*v, w2 = w*w;
	var L = u2+v2+w2, sL = Math.sqrt(L);
	var st = Math.sin(theta), ct = Math.cos(theta);
	var x = P.x, y = P.y, z = P.z;
	return new PVector(
				 ((a*(v2+w2)-u*(b*v+c*w-u*x-v*y-w*z))*(1-ct)+
				  L*x*ct+
	              sL*(-c*v+b*w-w*y+v*z)*st)/L,
	             ((b*(u2+w2)-v*(a*u+c*w-u*x-v*y-w*z))*(1-ct)+
	              L*y*ct+
	              sL*(c*u-a*w+w*x-u*z)*st)/L,
	             ((c*(u2+v2)-w*(a*u+b*v-u*x-v*y-w*z))*(1-ct)+
	              L*z*ct+
	              sL*(-b*u+a*v-v*x+u*y)*st)/L);
}

// If ab is the common edge between triangles abc and abd, compute the angle
// between the normals
dihedralAngle = function (a,b,c,d) {
	var ab = b.sub(a);
	var ba = a.sub(b);
	var bc = c.sub(b);
	var ad = d.sub(a);
	var nabc = ab.cross (bc); 
	nabc.normalize();
	var nabd = ba.cross (ad); 
	nabd.normalize();
	var cross = nabc.cross(nabd);
  	return (cross.dot(ab)<0) ? 
	    Math.atan2(-cross.mag(), nabc.dot(nabd)) :
    	Math.atan2(cross.mag(), nabc.dot(nabd));
}


// If ab is the common edge between triangles abc and abd, rotate c and d 
// symmetrically about ab so that the angle between the triangle normals
// becomes t. If factor is given, relaxation is attenuated by that factor 
// (a number between 0 and 1)
relaxDihedralAngle = function (a,b,c,d,t,factor) {
	factor = factor || 1;
	var ab = b.sub(a); 
	var ba = a.sub(b); 
	var bc = c.sub(b); 
	var ad = d.sub(a); 
	var nabc = ab.cross (bc); 
	nabc.normalize();
	var nabd = ba.cross (ad); 
	nabd.normalize();
	var cross = nabc.cross(nabd);
  	var ang = (cross.dot(ab)<0) ? 
	    Math.atan2(-cross.mag(), nabc.dot(nabd)) :
    	Math.atan2(cross.mag(), nabc.dot(nabd));
    t = ang*(1-factor)+t*factor;
	var newc = rotateAroundAxis (a,b,c,-(t-ang)/2);
	c.set(newc);
	var newd = rotateAroundAxis (a,b,d,(t-ang)/2);
	d.set(newd);
}

// Given two points a,b in 3D space, moves them along vector ab
// with respect to their midpoint so that they are exactly s
// units apart. If factor is given, relaxation is attenuated by that factor 
// (a number between 0 and 1)
var relaxLinear = function (a,b,s,factor) {
    var delta = b.sub(a);
    var deltalength = delta.mag(); 
    factor = factor || 1;
    s = deltalength * (1-factor) + s * factor;
    delta = delta.mult((deltalength-s)/deltalength/2); 
    a.set(a.add(delta));
    b.set(b.sub(delta));
}