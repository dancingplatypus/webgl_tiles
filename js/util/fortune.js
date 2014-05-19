// Fortune's algorithm.  A point and sweep approach to generating a
// Voronoi diagram.
define([], function() {

  // Given a point p and a line l (that doesn't contain p), then the set of
  // points whose distance to p equals the distance to l forms a parabola.

  // Given a point q(qx, qy) and whose disance to p is denoted by d(q,p),
  // the sweep line will always be horizontal (or vertical)

  //  let *(z) be the transformation *(z)=(z_x,z_y+d(z)),
  //      where d(z) is the Euclidean distance between z and the nearest site

  //  let T be the "beach line"
  //  let R_p be the region covered by site p.
  //      let C_{pq} be the boundary ray between sites p and q.
  //      let p_1,p_2,...,p_m be the sites with minimal y-coordinate, ordered by x-coordinate
  //  Q \gets S - {p_1,p_2,...,p_m}
  //create initial vertical boundary rays C_{p_1,p_2}^0,C_{p_2,p_3}^0,...C_{p_{m-1},p_m}^0
  //T \gets *(R_{p_1}),C_{p_1,p_2}^0,*(R_{p_2}),C_{p_2,p_3}^0,...,*(R_{p_{m-1}}),C_{p_{m-1},p_m}^0,*(R_{p_m})
  //while not IsEmpty(Q) do
  //  p ← DeleteMin(Q)
  //case p of
  //p is a site in *(V):
  //find the occurrence of a region *(R_q) in T containing p,
  //    bracketed by C_{rq} on the left and C_{qs} on the right
  //create new boundary rays C_{pq}^- and C_{pq}^+ with bases p
  //replace *(R_q) with *(R_q),C_{pq}^-,*(R_p),C_{pq}^+,*(R_q) in T
  //delete from Q any intersection between C_{rq} and C_{qs}
  //insert into Q any intersection between C_{rq} and C_{pq}^-
  //    insert into Q any intersection between C_{pq}^+ and C_{qs}
  //p is a Voronoi vertex in *(V):
  //let p be the intersection of C_{qr} on the left and C_{rs} on the right
  //let C_{uq} be the left neighbor of C_{qr} and
  //let C_{sv} be the right neighbor of C_{rs} in T
  //create a new boundary ray C_{qs}^0 if q_y = s_y,
  //    or create C_{qs}^+ if p is right of the higher of q and s,
  //    otherwise create C_{qs}^-
  //    replace C_{qr},*(R_r),C_{rs} with newly created C_{qs} in T
  //delete from Q any intersection between C_{uq} and C_{qr}
  //delete from Q any intersection between C_{rs} and C_{sv}
  //insert into Q any intersection between C_{uq} and C_{qs}
  //insert into Q any intersection between C_{qs} and C_{sv}
  //record p as the summit of C_{qr} and C_{rs} and the base of C_{qs}
  //output the boundary segments C_{qr} and C_{rs}
  //endcase
  //endwhile
  //output the remaining boundary rays in T


});