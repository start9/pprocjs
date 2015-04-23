import { Output }                           from '../structs/Output';
import { createFramebuffer, createTexture } from '../helpers';
import { vertexPositionBufferSymbol }       from '../symbols';
import { vertexTextureUvBufferSymbol }      from '../symbols';
import { vertexIndexBufferSymbol }          from '../symbols';

import { Pass }                             from './Pass';

export class ShaderPass extends Pass {

    constructor( gl, shader ) {

        super( );

        this.gl = gl;

        this.shader = shader;
        this.program = shader.getProgram( gl );

        this.uInputSamplerLocations = [ ];
        this.uInputResolutionLocations = [ ];

        this.inputs = null;
        this.output = new Output( );

        this.uOutputResolutionLocation = this.gl.getUniformLocation( this.program, 'uOutputResolution' );
        this.uScreenResolutionLocation = this.gl.getUniformLocation( this.program, 'uScreenResolution' );

        for ( let t = 0, T = this.shader.INPUT_SOURCES; t < T; ++ t ) {
        this.uInputSamplerLocations.push( this.gl.getUniformLocation( this.program, `uInputSampler_Prev${t}` ) );
        this.uInputResolutionLocations.push( this.gl.getUniformLocation( this.program, `uInputResolution_Prev${t}` ) ); }

        this.aVertexPositionLocation = this.gl.getAttribLocation( this.program, 'aVertexPosition' );
        this.aVertexTextureUvLocation = this.gl.getAttribLocation( this.program, 'aVertexTextureUv' );

        this.gl.useProgram( this.program );

        this.gl.enableVertexAttribArray( this.aVertexPositionLocation );
        this.gl.enableVertexAttribArray( this.aVertexTextureUvLocation );

        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.gl[ vertexPositionBufferSymbol ] );
        this.gl.vertexAttribPointer( this.aVertexPositionLocation, 3, this.gl.FLOAT, false, 0, 0 );
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );

        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.gl[ vertexTextureUvBufferSymbol ] );
        this.gl.vertexAttribPointer( this.aVertexTextureUvLocation, 2, this.gl.FLOAT, false, 0, 0 );
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, null );

        this.gl.useProgram( null );

    }

    refreshOutput( { cascade = true } = { } ) {

        if ( this.next && ! this.output.texture ) {

            let { width, height } = this.output.resolution;

            this.output.framebuffer = createFramebuffer( this.gl );
            this.output.texture = createTexture( this.gl );

            this.gl.bindTexture( this.gl.TEXTURE_2D, this.output.texture );
            this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGB, width, height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null );
            this.gl.bindTexture( this.gl.TEXTURE_2D, null );

            this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.output.framebuffer );
            this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.output.texture, 0 );
            this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );

        } else if ( ! this.next && this.output.texture ) {

            this.gl.deleteFramebuffer( this.output.framebuffer );
            this.gl.deleteTexture( this.output.texture );

            this.output.framebuffer = null;
            this.output.texture = null;

        }

        if ( this.next && cascade ) {
            this.next.refreshInputs( );
        }

    }

    refreshInputs( { cascade = true } = { } ) {

        this.gl.useProgram( this.program );

        this.inputs = this.previous ? this.previous.getOutputs( ) : [ ];
        this.valid = this.shader.INPUT_SOURCES <= this.inputs.length;

        let { width, height } = this.getResolution( );
        this.output.resolution = { width, height };

        if ( this.output.texture ) {
            this.gl.bindTexture( this.gl.TEXTURE_2D, this.output.texture );
            this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGB, width, height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null );
            this.gl.bindTexture( this.gl.TEXTURE_2D, null );
        }

        for ( let t = 0, T = Math.min( this.inputs.length, this.shader.INPUT_SOURCES ); t < T; ++ t ) {
            this.gl.uniform1i( this.uInputSamplerLocations[ t ], this.inputs[ t ].texture );
            this.gl.uniform2f( this.uInputResolutionLocations[ t ], this.inputs[ t ].resolution.width, this.inputs[ t ].resolution.height );
        }

        this.gl.useProgram( null );

        if ( this.next && cascade ) {
            this.next.refreshInputs( );
        }

    }

    getResolution( ) {

        return this.shader.getResolution( this );

    }

    getOutputs( ) {

        let previous = this.previous ? this.previous.getOutputs( ) : [ ];

        return [ this.output ].concat( previous );

    }

    render( target ) {

        if ( ! this.valid )
            throw new Error( 'Invalid pass' );

        this.gl.useProgram( this.program );
        this.gl.viewport( 0, 0, this.output.resolution.width, this.output.resolution.height );

        this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.output.framebuffer || target );
        this.gl.clear( this.gl.COLOR_BUFFER_BIT );

        for ( let t = 0, T = this.shader.INPUT_SOURCES; t < T; ++ t ) {
            this.gl.activeTexture( this.gl.TEXTURE0 + t );
            this.gl.bindTexture( this.gl.TEXTURE_2D, this.inputs[ t ].texture );
        }

        this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.gl[ vertexIndexBufferSymbol ] );
        this.gl.drawElements( this.gl.TRIANGLE_STRIP, 4, this.gl.UNSIGNED_SHORT, 0 );

    }

}
