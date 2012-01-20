//---------------------------------------------------------------------
//  Scene Graph to make a drawable hierarchy of nodes.
//
//  Scene graph objects: Node -> Group -> Transform
//                            -> Geode
//
// Each node has a traverse() method that does the appropriate thing
// for the node type.
// Groups just walk their children,
// Transforms make coordinate system changes and keep walking,
// Geodes just draw themselves.
//
//
// More info on scene graphs: http://techpubs.sgi.com/library/dynaweb_docs/0640/SGI_Developer/books/Perf_PG/sgi_html/ch03.html
//---------------------------------------------------------------------


//----------------------------------------------------------------------
// base class, 'data' probably has a draw() or transform() method.
//----------------------------------------------------------------------
Gfx.Node = DefineClass(
    {
        init:  function( data ) {
            if (data) {
                $.extend( this, data );
            }
        },

        // true if cursor is hovering over this node
        isUnderCursor: function() {
            return false;
        }
    }
);

//----------------------------------------------------------------------
//   Group - traversable list of nodes
//----------------------------------------------------------------------
Gfx.Group = DefineClass(
    Gfx.Node,
    {
        init: function( data ) {
            Gfx.Node.init.call( this, data );
            this.children = [];
        },

        traverse: function ( gl ) {
            $.each( this.children,
                    function( i, node ) {
                        node.traverse.call( this, gl );
                    });
        },
        add: function( node ) {
            this.children.push( node );
        }
    }
);


//----------------------------------------------------------------------
//   Geode - a drawable node (leaf)
//----------------------------------------------------------------------
Gfx.Geode = DefineClass(
    Gfx.Node,
    {
        init: function( data ) {
            Gfx.Node.init.call( this, data );
        },

        // just draw
        traverse: function ( gl ) {
            if ($.isFunction( this.draw )) {
                this.draw.call( this, gl );
            }
        }
    }
);


//----------------------------------------------------------------------
//   Text - a drawable string
//----------------------------------------------------------------------
Gfx.TextNode = DefineClass(
    Gfx.Node,
    {
        init: function( data ) {
            Gfx.Node.init.call( this, data );
        },

        // just draw
        traverse: function ( gl ) {
            if (this.text ) {
                gl.save();

                gl.font = "bold 12px sans-serif";
                gl.textBaseline = "top";
                gl.fillText( this.text, this.x, this.y);

                gl.restore();
            }
        }
    }
);


//----------------------------------------------------------------------
//   Transform - a node that is a coordinate system change (parent)
//----------------------------------------------------------------------
Gfx.Transform = DefineClass(
    Gfx.Group,
    {
        init: function( data ) {
            Gfx.Group.init.call( this, data);
        },

        // apply transform and keep traversing
        traverse: function ( gl ) {

            gl.save();    // isolate transformations to this subtree

            if ($.isFunction( this.transform )) {
                this.transform.call( this, gl );
            }
            Gfx.Group.traverse.call( this, gl );

            gl.restore();
        }
    }
);
