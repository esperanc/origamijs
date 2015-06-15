/* 
 * Represents a point or vector in R3 
 */
PVector = function (x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z || 0;
}

// Conversion to string
PVector.prototype.toString = function () {
	return "["+this.x+","+this.y+","+this.z+"]";
}

// Create a copy 
PVector.prototype.clone = function () {
	return new PVector (this.x, this.y, this.z);
}

// Assign from another PVector
PVector.prototype.set = function (other) {
	this.x = other.x; this.y = other.y; this.z = other.z;
}

// Returns the addition of two PVectors
PVector.prototype.add = function (other) {
	return new PVector (this.x + other.x, this.y + other.y, this.z + other.z);
}

// Returns the difference between this and other
PVector.prototype.sub = function (other) {
	return new PVector (this.x - other.x, this.y - other.y, this.z - other.z);
}

// Returns this Scaled or multiplied coordinatewise with other
PVector.prototype.mult = function (other) {
	if (typeof other == "number") 
		return new PVector (this.x * other, this.y * other, this.z * other);
	else 
		return new PVector (this.x * other.x, this.y * other.y, self.z * other.z); 
}

// Returns the dot product with other
PVector.prototype.dot = function (other) {
	return this.x * other.x + this.y * other.y + this.z * other.z;
}

// Returns the cross product with other
PVector.prototype.cross = function (other) {
	return new PVector (this.y * other.z - other.y * this.z,
                    this.z * other.x - other.z * this.x,
                    this.x * other.y - other.x * this.y);
}

// Returns the squared length
PVector.prototype.mag2 = function () {
	return this.dot (this);
}

// Returns the length
PVector.prototype.mag = function () {
	return Math.sqrt (this.mag2());
}

// Normalizes this PVector
PVector.prototype.normalize = function () {
	var m = this.mag();
	if (m > 1.0e-20) {
		this.x /= m; this.y /= m; this.z /= m;
	} 
}
