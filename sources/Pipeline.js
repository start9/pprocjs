import { EntryPass }              from './passes/EntryPass';
import { ShaderPass }             from './passes/ShaderPass';

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

    node.previous.next = null;
    node.previous = null;

}

export class Pipeline {

    constructor( gl ) {

        this._gl = gl;

        this._passes = [ new EntryPass( this._gl ) ];

        importPrivateGlBuffers( gl );

        Object.defineProperty( this, 'entry', {
            get : ( ) => this._passes[ 0 ]
        } );

        Object.defineProperty( this, 'length', {
            set : ( value ) => this.splice( value, this.length ),
            get : ( ) => this._passes.length - 1
        } );

    }

    get( index ) {

        return this._passes[ index + 1 ];

    }

    splice( offset, count, ... shaders ) {

        if ( offset < 0 )
            offset = 0;

        if ( offset > this.length )
            offset = this.length;

        if ( count < 0 )
            count = 0;

        if ( offset + count > this.length )
            count = this.length - offset;

        let innerOffset = offset + 1;

        let inserted = shaders.map( shader => new ( shader.PASS_TYPE )( this._gl, shader ) );
        let removed = this._passes.splice( innerOffset, count, ... inserted );

        for ( let t = 0, T = removed.length; t < T; ++ t )
            unlink( removed[ t ] );

        for ( let t = 0, T = inserted.length + 1; t < T; ++ t )
            link( this._passes[ innerOffset + t - 1 ], this._passes[ innerOffset + t ] );

        for ( let pass of removed ) {
            pass.refreshOutput( );
            pass.refreshInputs( );
        }

        let previous = this._passes[ innerOffset - 1 ];
        previous.refreshOutput( );

        for ( let pass of inserted )
            pass.refreshOutput( );

        for ( let t = innerOffset, T = this._passes.length; t < T; ++ t )
            this._passes[ t ].refreshInputs( );

        return removed.map( effect => {
            return effect.shader;
        } );

    }

    unshift( shader ) {

        this.splice( 0, 0, shader );

        return this.get( 0 );

    }

    push( shader ) {

        this.splice( this.length, 0, shader );

        return this.get( this.length - 1 );

    }

    shift( ) {

        return this.splice( 0, 1 )[ 0 ];

    }

    pop( ) {

        return this.splice( this.length - 1, 1 )[ 0 ];

    }

    render( target = null ) {

        for ( let pass of this._passes ) {
            pass.render( target );
        }

    }

}
