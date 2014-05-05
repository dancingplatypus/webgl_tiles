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
