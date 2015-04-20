import { Output }        from '../structs/Output';
import { Pass }          from '../structs/Pass';

import { createTexture } from '../helpers';

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

        this.setInputData( this.gl.RGBA, this.gl.UNSIGNED_BYTE, null );

    }

    setInputData( format, type, data ) {

        this.gl.bindTexture( this.gl.TEXTURE_2D, this.output.texture );
        this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.output.resolution.width, this.output.resolution.height, 0, format, type, data );
        this.gl.bindTexture( this.gl.TEXTURE_2D, null );

    }

    refreshOutput( ) {

    }

    getOutputs( ) {

        return [ this.output ];

    }

    render( target ) {

    }

}
