import { Output }        from '../structs/Output';
import { createTexture } from '../helpers';

import { Pass }          from './Pass';

export class EntryPass extends Pass {

    constructor( gl ) {

        super( );

        this.gl = gl;

        this.output = new Output( );
        this.output.texture = createTexture( this.gl );

    }

    setInputSize( width, height ) {

        this.output.resolution.width = width;
        this.output.resolution.height = height;

        this.setInputData( this.gl.RGB, this.gl.UNSIGNED_BYTE, null );

        this.next && this.next.refreshInputs( );

    }

    setInputData( format, type, data ) {

        this.gl.bindTexture( this.gl.TEXTURE_2D, this.output.texture );
        this.gl.texImage2D( this.gl.TEXTURE_2D, 0, format, this.output.resolution.width, this.output.resolution.height, 0, format, type, data );
        this.gl.bindTexture( this.gl.TEXTURE_2D, null );

    }

    refreshOutput( { cascade = true } = { } ) {

        if ( this.next && cascade ) {
            this.next.refreshInputs( );
        }

    }

    refreshInputs( { cascade = true } = { } ) {

        if ( this.next && cascade ) {
            this.next.refreshInputs( );
        }

    }

    getOutputs( ) {

        return [ this.output ];

    }

    render( target ) {

    }

}
