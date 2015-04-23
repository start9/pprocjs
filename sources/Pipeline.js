import { EntryPass }              from './passes/EntryPass';
import { ShaderPass }             from './passes/ShaderPass';
import { Pass }                   from './passes/Pass';
import { Shader }                 from './shaders/Shader';

import { importPrivateGlBuffers } from './symbols';

function link( from, to ) {

    if ( ! from || ! to )
        return ;

    if ( from.next === to )
        return ;

    from.next = to;
    to.previous = from;

}

function unlink( node ) {

    if ( node.previous ) {
        node.previous.next = null;
        node.previous = null;
    }

    if ( node.next ) {
        node.next.previous = null;
        node.next = null;
    }

}

function castToPass( element, gl ) {

    if ( element instanceof Pass )
        return element;

    if ( element instanceof Shader )
        return new ( element.PASS_TYPE )( gl, element );

    throw new Error( 'This element cannot be casted to a valid pprocjs pass' );

}

export class Pipeline {

    constructor( gl ) {

        this._gl = gl;
        this._passes = [ ];

        importPrivateGlBuffers( gl );

        this.entry = new EntryPass( this._gl );

    }

    createPass( element ) {

        return castToPass( element, this._gl );

    }

    applyShaders( elements ) {

        for ( let t = 0; t < this._passes.length; t += 2 ) {
            unlink( this._passes[ t ] );
            this._passes[ t ].refreshInputs( );
            this._passes[ t ].refreshOutput( );
        }

        let passes = elements.map( element => this.createPass( element ) );
        this._passes = [ this.entry ].concat( passes );

        for ( let t = 0; t < this._passes.length; ++ t ) {
            link( this._passes[ t ], this._passes[ t + 1 ] );
            this._passes[ t ].refreshOutput( { cascade : false } );
        }

        this.entry.refreshInputs( );

        return passes;

    }

    render( target = null ) {

        for ( let pass of this._passes ) {
            pass.render( target );
        }

    }

}
