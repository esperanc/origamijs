
// Restricts two points a and b to be s units apart
LinearConstraint = function(a,b,s) {

	var self = this;
	self.a = a;
	self.b = b;
	self.s = s;

	// Relaxes with strength factor (a float between 0 and 1, 1 by default)
	self.relax = function (factor) {
		relaxLinear (self.a, self.b, self.s,factor);
	}

	// Returns the current discrepancy
	self.discrepancy = function () {
		var s = this.a.sub(self.b).mag();
		return Math.abs(s-self.s)/Math.max(s,self.s);
	}

}

// Restricts two triangles sharing an edge to have a given angle between them 
DihedralConstraint = function (a,b,c,d,ang) {

    var self = this;
	self.a = a;
	self.b = b;
	self.c = c;
	self.d = d;
	self.ang = ang;

	// Relaxes with strength factor (a float between 0 and 1, 1 by default)
	self.relax = function (factor) {
		var bary = self.a.add(self.b).add(self.c).add(self.d).mult(0.25);
		relaxDihedralAngle (self.a,self.b,self.c,self.d,self.ang,factor);
		// Maintain former barycenter of the 4 vertices
		var newBary = self.a.add(self.b).add(self.c).add(self.d).mult(0.25);
		var delta = bary.sub(newBary);
		self.a.set(a.add(delta));
		self.b.set(b.add(delta));
		self.c.set(c.add(delta));
		self.d.set(d.add(delta));
	}

	// Returns the dihedral angle
	self.angle = function () {
		return dihedralAngle(self.a,self.b,self.c,self.d);
	}
	// Returns the current discrepancy
	self.discrepancy = function () {
		var ang = self.angle();
		return Math.abs (ang-self.ang);
	}
}
