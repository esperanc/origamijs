// A Halfedge structure
// All fields are integer numbers which are supposed to 
// be used as indices or keys to other data structures which store related
// information.
function Halfedge (vtx, opp, nxt, prv, fac) {
	this.vtx = vtx;
	this.opp = opp;
	this.nxt = nxt;
	this.prv = prv;
	this.fac = fac;
}

// A Halfedge data structure
// Builds a halfedge data structure for a mesh, where
// face is an array vertex circulations represented by arrays of 
// integer. Each integer is supposed to identify an element
// in array vertex
function HalfedgeDS (face, vertex) {

	this.faceh = [];     // Face halfedge table
	this.vertexh = [];   // Vertex halfedge table
	this.halfedge = [];  // Halfedge table
	this.vertex = vertex;
	this.face = face;
	this.borderh = [];  // Outside face halfedge table

	var edgedic = {}; // An edge dictionary to map pairs of vertex indices to halfedges

	// Iterate over all faces
	for (var iface = 0; iface<face.length; iface++) {
		var f = face[iface];
		var vprev = f [f.length-1];
		for (var iv = 0; iv < f.length; iv++) {
			var v = f[iv]; // Index of vertex
			var ihe = this.halfedge.length; //
			var key = v+","+vprev;
			// Find opposite halfedge
			var opposite = -1;
			if (edgedic[key] != undefined) {
				opposite = edgedic[key];
				this.halfedge[opposite].opp = ihe;
			}
			// This halfedge must not have been entered yet
			key = vprev+","+v;
			if (edgedic[key] != undefined) {
				console.log ("Edge "+key+" defined twice");
			}
			edgedic[key] = ihe;
			// Compute previous
			var previous =  iv == 0 ? ihe + f.length - 1 : ihe-1;
			// Compute next
			var next = iv == f.length-1 ? ihe - f.length + 1 : ihe+1;
			// Create the halfedge
			var he = new Halfedge (v,opposite,next,previous,iface);
			this.halfedge.push(he);
			// Associate this halfedge to the vertex in the vertexh table
			this.vertexh [v] = ihe;
			vprev = v;
		}
		// Face halfedge is the last halfedge created
		this.faceh [iface] = this.halfedge.length-1;
	} 

	// Create 'border' halfedges so that vertex circulations do not break
	while (true) {
		// Try to find one unpaired edge
		var he;
		var found = false;
		for (var ih = 0; ih < this.halfedge.length; ih++) {
			he = this.halfedge [ih];
			if (he.opp == -1) {
				found = true;
				break;
			}
		}
		if (!found) break; // No unpaired edges
		// Collect the loop of unpaired edges
		var loop = [he];
		var closed = false;
		while (!closed) {
			// Fetch next halfedge of the outside loop
			var next = this.halfedge[he.nxt];
			while (next.opp != -1) {
				next = this.halfedge[next.opp];
				next = this.halfedge[next.nxt];
				if (next == he) {
					console.log ("Weird cycle");
					return;
				}
			} 
			if (loop.indexOf (next) >= 0) {
				closed = true;
			}
			else {
				loop.push (next);
				he = next;
			}
		}
		// Create border halfedges as twins of those in loop
		var n = this.halfedge.length;
		for (var i = 0; i < loop.length; i++) {
			var he = loop[i];
			var ihe = this.halfedge[he.nxt].prv;
			var itwin = n+i;
			var opp = ihe;
			he.opp = itwin;
			var nexti = (i+1)%loop.length;
			var prv = n+nexti;
			var previ = (i+loop.length-1)%loop.length;
			var nxt = n+previ;
			var fac = -this.borderh.length-1;
			var vtx = loop[previ].vtx;
			this.halfedge.push (new Halfedge (vtx,opp,nxt,prv,fac));
		}
		// Remember this outside face
		this.borderh.push (n);
	}
 
}

// Iterator to traverse all vertices of a HE data structure.
// Calls f for each vertex v with the following arguments:
//    he : one halfedge incident on that vertex
//    v : the vertex structure associated with that vertex
// If f returns anything other than undefined, the traversal
// is interrupted
HalfedgeDS.prototype.allVertices = function (f) {
	for (var i = 0; i < this.vertexh.length; i++) {
		var ihe = this.vertexh [i];
		if (ihe == undefined) continue;
		var he = this.halfedge [ihe];
		if (f (he, this.vertex[he.vtx]) != undefined) return;
	}
}

// Iterator to traverse all faces of a HE data structure.
// Calls f for each face with the following arguments:
//    he : one halfedge incident on that face
// If f returns anything other than undefined, the traversal
// is interrupted
HalfedgeDS.prototype.allFaces = function (f) {
	for (var i = 0; i < this.faceh.length; i++) {
		var ihe = this.faceh [i];
		if (ihe == undefined) continue;
		var he = this.halfedge [ihe];
		if (f (he) != undefined) return;
	}	
}

// Iterator to traverse all outside faces of a HE data structure.
// Calls f for each outside face with the following arguments:
//    he : one halfedge incident on that face
// If f returns anything other than undefined, the traversal
// is interrupted
HalfedgeDS.prototype.allOutsideFaces = function (f) {
	for (var i = 0; i < this.borderh.length; i++) {
		var ihe = this.borderh [i];
		if (ihe == undefined) continue;
		var he = this.halfedge [ihe];
		if (f (he) != undefined) return;
	}	
}

// Iterator to traverse all edges of a HE data structure.
// Calls f for each edge with the following arguments:
//    he : one halfedge incident on that edge
//    phe : halfedge previous to he in the face circulation
// If f returns anything other than undefined, the traversal
// is interrupted
HalfedgeDS.prototype.allEdges = function (f) {
	for (var i = 0; i < this.halfedge.length; i++) {
		var he = this.halfedge [i];
		if (he == undefined) continue;
		if (he.opp != -1 && he.opp < i) continue;
		if (f (he,this.halfedge[he.prv]) != undefined) return;
	}
} 

// Iterates over each halfedge of a face circulation starting
// at halfedge he
HalfedgeDS.prototype.faceCirculator = function (f, he) {
	var start = he;
	var fac = he.fac;
	//var max = 20; // A failsafe for corrupt hds
	while (true) {
		assert (he.fac == fac);
		if (f (he) != undefined) break;
		he = this.halfedge[he.nxt];
		if (he === start) break;
		//if (max-- == 0) throw "Corrupt hds in face circulation";
	}
}

// Iterates over each halfedge of a vertex circulation starting
// at halfedge he
HalfedgeDS.prototype.vertexCirculator = function (f, he) {
	var start = he;
	var vtx = he.vtx;
	var max = 20; // A failsafe for corrupt hds
	while (true) {
		assert (he.vtx == vtx);
		if (f (he) != undefined) break;
		he = this.halfedge[he.nxt];
		he = this.halfedge[he.opp];
		if (he === start) break;
		if (max-- == 0) throw "Corrupt hds in vertex circulation";
	}
}


// Given two halfedges incident on the same face, splits it into two faces.
// Returns a halfedge for the new edge created.
HalfedgeDS.prototype.splitFace = function (h,g) {
	if (h.fac != g.fac) { throw "Not halfedges on the same face"; }
	if (h.fac < 0) { throw "Cant split a border face" }
	var self = this;
	var new_face = self.faceh.length;
	var index_g = self.index(g);
	var index_h = self.index(h);
	var i = self.halfedge.length;
	var j = i+1;
	var he_i = new Halfedge (g.vtx, j, g.nxt, index_h, h.fac);
	var he_j = new Halfedge (h.vtx, i, h.nxt, index_g, new_face);
	self.halfedge.push (he_i);
	self.halfedge.push (he_j);
	var iter = h.nxt;
	var max = 20;
	while (iter != index_g) {
		self.halfedge[iter].fac = new_face;
		var iter = self.halfedge[iter].nxt;
		if (max-- == 0) throw "Corrupt hds in vertex circulation";
	}
	self.halfedge[iter].fac = new_face;
	self.halfedge[g.nxt].prv = i;
	g.nxt = j;
	self.halfedge[h.nxt].prv = j;
	h.nxt = i;
	self.faceh.push (j);
	self.faceh[he_i.fac] = i;
	self.vertexh[he_i.vtx] = i;
	self.vertexh[he_j.vtx] = j; 
	return he_j;
} 



// Returns an unused index for array a - either the first undefined
// position or a.length
function newIndex (a) {
	for (var i = 0; i < a.length; i++) 
		if (a[i] === undefined) return i;
	return a.length;
}

function assert (condition) {
	if (!condition) throw "Assertion error";
}

// Given a halfedge h, joins the two faces that h separates
// Returns a halfedge for the new edge created.
HalfedgeDS.prototype.joinFace = function (h) {
	if (h.fac < 0 || hds.halfedge[h.opp].fac < 0) { throw "Can't join outside faces"; };
	var self = this;
	var index_h = self.index(h);
	var g = self.halfedge[h.opp];
	var index_g = h.opp;
	var face_g = g.fac;
	self.faceCirculator(function (hi) {
		hi.fac = h.fac;
	}, g);
	self.halfedge[g.prv].nxt = h.nxt;
	self.halfedge[h.prv].nxt = g.nxt;
	self.halfedge[g.nxt].prv = h.prv;
	self.halfedge[h.nxt].prv = g.prv;
	self.halfedge[index_g] = undefined;
	self.halfedge[index_h] = undefined;
	self.faceh [face_g] = undefined;
	if (self.faceh[h.fac] == index_h) {
		assert (self.halfedge[h.prv].fac == h.fac);
		self.faceh[h.fac] = h.prv;
	}
	if (self.vertexh[h.vtx] == index_h) {
		assert (self.halfedge[g.prv].vtx == h.vtx);
		self.vertexh[h.vtx] = g.prv;
	}
	if (self.vertexh[g.vtx] == index_g) {
		assert (self.halfedge[h.prv].vtx == g.vtx);
		self.vertexh[g.vtx] = h.prv;
	}
	return self.halfedge[h.nxt];
}


// Given two halfedges incident on the same vertex, splits it into two vertices.
// The new vertex v is put in the halfedge table pointed to by h.
// Returns a halfedge for the new edge created.
HalfedgeDS.prototype.splitVertex = function (h,g,v) {
	if (h.vtx != g.vtx) { throw "Both halfedges should point to the same vertex"};
	var self = this;
	var index_g = self.index(g);
	var index_h = self.index(h);
	var new_vtx = self.vertexh.length;
	self.vertex[new_vtx] = v;
	self.vertexh[h.vtx] = index_g;
	self.vertexh[new_vtx] = index_h;
	var max = 20;
	var he = h;
	while (he != g) {
		he.vtx = new_vtx; 
		he = self.halfedge[he.opp];
		he = self.halfedge[he.prv];
		if (max-- == 0) throw "Inconsistent vertex circulation";
	};
	var i = self.halfedge.length;
	var j = i+1;
	var h_i = new Halfedge(g.vtx,j,h.nxt,index_h,h.fac);
	hds.halfedge.push (h_i);
	var h_j = new Halfedge(new_vtx,i,g.nxt,index_g,g.fac);
	hds.halfedge.push (h_j);
	self.halfedge[h.nxt].prv = i;
	self.halfedge[g.nxt].prv = j;
	h.nxt = i;
	g.nxt = j;
	return h_j;
}

// Given a halfedge h pointing to a vertex, joins this vertex with 
// vertex pointed to by h.opp and eliminate edge h/h.opp. Returns
// a halfedge pointing to the joined vertex
HalfedgeDS.prototype.joinVertex = function (h) {
	var self = this;
	var g = self.halfedge[h.opp];
	var index_g = h.opp;
	var index_h = g.opp;
	var old_vtx = h.vtx; // Gets removed
	var new_vtx = g.vtx; 
	var max = 20;
	self.vertexCirculator(function (he) {
		he.vtx = new_vtx;
	}, h);
	self.halfedge[h.prv].nxt = h.nxt;
	self.halfedge[h.nxt].prv = h.prv;
	self.halfedge[g.prv].nxt = g.nxt;
	self.halfedge[g.nxt].prv = g.prv;
	self.vertexh[old_vtx] = undefined;
	self.vertex[old_vtx] = undefined;
	self.halfedge[index_h] = undefined;
	if (self.vertexh[g.vtx] == index_g) {
		assert (self.halfedge[h.prv].vtx = g.vtx);
		self.vertexh[g.vtx] = h.prv;
	}
	self.halfedge[index_g] = undefined;
	return self.halfedge[h.prv];
}



// Returns the index of a halfedge object inside the halfedge table
HalfedgeDS.prototype.index = function(he) {
	if (this.halfedge[he.nxt].prv != this.halfedge[he.opp].opp) {
		throw "Corrupt hds: nxt.prv ("+this.halfedge[he.nxt].prv+") != opp.opp ("+this.halfedge[he.opp].opp+")";
	}
	return this.halfedge[he.nxt].prv;
}

// Returns a halfedge from v1 to v0 (vertex indices), or
// undefined if none is found
HalfedgeDS.prototype.findEdge = function (v0,v1) {
	if (v0 < 0 || v0 >= this.halfedge.length) { throw "Invalid vertex"; }
	var ret;
	var self = this;
	self.vertexCirculator(function (he) {
		if (self.halfedge[he.opp].vtx == v1) {
			ret = he;
			return 1;
		}
	}, self.halfedge[self.vertexh[v0]]);
	return ret;
}

//
// If setborder is given, makes the face bounded by halfedge he a border (setborder = true) 
// or regular (setborder=false) face, otherwise, toggles the border status, i.e.,
// makes it border if it is not, or regular if it is border.
//
HalfedgeDS.prototype.toggleBorder = function (he, setborder) {
	var makeborder;
	if (setborder === undefined) makeborder = he.fac >= 0;
	else makeborder = setborder;
	if (makeborder == (he.fac < 0)) return; // Nothing to be done
	var newindex;

	if (he.fac < 0) {
		this.borderh [-he.fac-1] = undefined;
		newindex = newIndex(this.faceh);
		this.faceh[newindex] = this.index(he);
		this.faceCirculator (function (h) {
			h.fac = newindex;
		}, he);
	}
	else {
		this.faceh[he.fac] = undefined;
		newindex = newIndex(this.borderh);
		this.borderh [newindex] = this.index(he);
		this.faceCirculator(function(h) {
			h.fac = -newindex-1;
		}, he);
	}
}


// Cuts edge pointed to by halfedge he in halfedge data structure hds.
// At the end, a new outside face is created between he and its opposite.
function cutEdge (hds,he) {
	var prev = hds.halfedge [he.prv];
	var result = hds.splitFace (prev,he);
	hds.toggleBorder (result, true);
}

// Checks if the given vertex in hds has two neighbor outside (border) faces.
// If so, duplicates the vertex and joins the two faces, returning
// a halfedge pointing to the new (duplicate) vertex. Otherwise, returns
// undefined
function snipVertex (hds, vtx) {
	var bh = [];
	var vh = hds.halfedge[hds.vertexh[vtx]];
	hds.vertexCirculator (function (h) {
		if (h.fac < 0) {
			bh.push(h);
			if (bh.length == 2) return -1; /* Break */ 
		}
	}, vh);

	if (bh.length == 2) {
		/* Temporarily make the two faces inside faces, since 
		 * joinface can't process outside faces */
		hds.toggleBorder (bh[0], false);
		hds.toggleBorder (bh[1], false);
		var newvtxpos = hds.vertex[vtx].clone();
		var newvtx_h = hds.splitVertex(bh[0],bh[1],newvtxpos);
		var newvtx = newvtx_h.vtx;
		var joinh = hds.joinFace(newvtx_h);
		hds.toggleBorder (joinh);
		return newvtx_h;
	}
}

function check_hds (hds) {
	var fail = false;
	for (var i = 0; i < hds.halfedge.length; i++) {
		var h = hds.halfedge[i];
		if (h == undefined) continue;
		if (hds.halfedge[h.nxt] == undefined) { fail = true; console.log (i+" .nxt = undefined"); }
		if (hds.halfedge[h.opp] == undefined) { fail = true; console.log (i+" .opp = undefined"); }
		if (hds.halfedge[h.nxt].prv != i) {fail = true; console.log (i, "nxt.prv inconsistent"); }
		if (hds.halfedge[h.opp].opp != i) {fail = true; console.log (i, "opp.opp inconsistent"); }
	}
	if (fail) throw "hds inconsistent";
}
