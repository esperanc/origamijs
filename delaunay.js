
//
// Returns the determinant of a 3x3 matrix (stored by row)
//
function det3 (m) {
	var determinant = 0;
	for(var i = 0; i < 3; i++) {
    	determinant = determinant + (m[0][i]*(m[1][(i+1)%3]*m[2][(i+2)%3] - m[1][(i+2)%3]*m[2][(i+1)%3]));
  	}
  	return determinant;
}

//
// Returns the orientation (in 2D) of circulation p,q,r, i.e.,
// returns 0 if points p,q,r are collinear, <0 if p,q,r is a clockwise
// circulation or >0 if p,q,r is a counterclockwise circulation
//
function circulation (p,q,r) {
	var m = [ [1, 1, 1],
	          [p.x, q.x, r.x],
	          [p.y, q.y, r.y] ];
	return det3 (m);
}
//
// Returns an array [center,radius] with the center and radius of a triangle
// with vertices p,q,r. Points are represented by PVectors
// 
function circumCircle (p,q,r) {
	var m = [ [p.x, p.y, 1],
	          [q.x, q.y, 1],
	          [r.x, r.y, 1]];
	var a = det3(m);
	m[0][0] = p.x*p.x + p.y*p.y; 
	m[1][0] = q.x*q.x + q.y*q.y; 
	m[2][0] = r.x*r.x + r.y*r.y;
	var bx = -det3(m);
	m[0][1] = p.x; m[1][1] = q.x; m[2][1] = r.x;
	var by = det3(m);
	m[0][2] = p.y; m[1][2] = q.y; m[2][2] = r.y;
	var c = -det3(m);
	var center = new PVector(-bx / 2 / a, -by / 2 / a, 0);
	var radius = Math.sqrt(bx*bx+by*by-4*a*c)/ 2 / Math.abs(a);
	return [center, radius];
}

//
// If ab is a common edge of two triangles abc and abd then 
// this function returns true if edge ab is Delaunay, i.e., 
// if c is outside the circumcircle of abd and d is outside
// the circumcircle abc
//
function isDelaunay (a,b,c,d) {
	var cc = circumCircle (a,b,c);
	if (cc[0].sub(d).mag() < cc[1]) return false;
	cc = circumCircle (a,b,d);
	if (cc[0].sub(c).mag() < cc[1]) return false;
	return true;	 
}

//
// If ab is a common edge of two triangles abc and abd then 
// this function returns true if line segment cd intersects
// line segment ab.
//
function isFlippable (a,b,c,d) {
	return (circulation (c,d,a) < 0) != (circulation (c,d,b) < 0);
}
