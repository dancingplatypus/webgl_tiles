05/18/2014 Forever Earth
========================

The 50,000 foot dream -- build a procedural world onto which crowdsourced content can be merged, providing endless procedural and crafted adventures..

Using a perlin noise generator to generate landscape.
http://www.sjeiti.com/perlin-noise-versus-simplex-noise-in-javascript-final-comparison/

Used Toji's code to set up a tilemap system to map a selector image to a sprite map to show a constructed tiled world.
http://blog.tojicode.com/2012/07/sprite-tile-maps-on-gpu.html

Hooked up the gamepad.  Which is funny, because I haven't hooked up the keyboard yet.

I briefly experimented with voronoio, and specfiically Rayond Hill's javascript implementations:
http://www.raymondhill.net/voronoi/rhill-voronoi.html
https://code.google.com/p/javascript-voronoi/

I was hoping to have copied something this guy was doing, because I thought the maps were pretty:
http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/

But I realized the simplex approach was pretty quick and gave me what I needed.

Next step... removing some hiccups where  Iwastewully recompute an entire perlin tile instead of building onto one that I have.  Then maybe some clouds that blissfully sail by.  The rivers.  And Roads.  And settlements.  And finally we can move onto inhabitants.  One day a playable character.  *Returns to dream...*


webgl_tiles
===========

Playing around with tiling and xbox controllers this Sunday.

I took toji's tile to texture code:
http://blog.tojicode.com/2012/07/sprite-tile-maps-on-gpu.html
And kinda ripped into it a bit.  

I made it fullscreen (Bah, who needs to maintain aspect ratio?).
I also put hooked up the gamepad.  To move around, hook up a 360 controller and
press a button, then use the left stick to look at the scene.

I'm also playing around with some very very basic parsing of data produced by Tiled.
http://www.mapeditor.org/
So there's something else to learn... Tiled seems to have a nice rules engine for complicating
the borders between map tiles (coastlines, et al).  But I decided that my first attempt should
be horrendous so that I'll have something to work towards.

This was really simple, and very easy to do.  The biggest time suck was playing with maps
and finding some resources.  My destination?  spritedatabase.net
http://spritedatabase.net/file/9524
