import { ShaderPass }                  from '../passes/ShaderPass';

import { createProgram, createShader } from '../helpers';

export class Shader {

    constructor( { PASS_TYPE, OUTPUT_FACTOR, INPUT_SOURCES, fragment, vertex } ) {

        this.PASS_TYPE = PASS_TYPE || ShaderPass;

        this.OUTPUT_FACTOR = OUTPUT_FACTOR || 1;

        this.INPUT_SOURCES = INPUT_SOURCES || 1;

        this.fragment = fragment || `

            precision mediump float;

            uniform sampler2D uInputSampler;

            varying vec2 vTextureCoordinates;

            void main( void ) {
                gl_FragColor = texture2D( uInputSampler, vTextureCoordinates );
            }

        `;

        this.vertex = vertex || `

            precision mediump float;

            attribute vec3 aVertexPosition;
            attribute vec2 aVertexTextureUv;

            varying vec2 vTextureCoordinates;

            void main( void ) {
                vTextureCoordinates = vec2( aVertexTextureUv.s, aVertexTextureUv.t );
                gl_Position = vec4( aVertexPosition, 1.0 );
            }

        `;

    }

    getResolution( pass ) {

        if ( ! pass.inputs.length )
            return { width : 0, height : 0 };

        let { width, height } = pass.inputs[ 0 ].resolution;

        return { width : width * this.OUTPUT_FACTOR, height : height * this.OUTPUT_FACTOR };

    }

    getProgram( gl ) {

        let fragmentPrefix = `
            #define uInputSampler uInputSampler_Prev0
            #define uInputResolution uInputResolution_Prev0
        `;

        let vertexPrefix = `
            #define uInputSampler uInputSampler_Prev0
            #define uInputResolution uInputResolution_Prev0
        `;

        let fragment = createShader( gl, gl.FRAGMENT_SHADER, fragmentPrefix + this.fragment );
        let vertex = createShader( gl, gl.VERTEX_SHADER, vertexPrefix + this.vertex );

        return createProgram( gl, fragment, vertex );

    }

}
