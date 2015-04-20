import { ContainmentPass } from '../passes/ContainmentPass';

import { Shader }          from './Shader';

export class ContainmentShader extends Shader {

    constructor( ) { super( {

        PASS_TYPE : ContainmentPass,

        vertex : `

            precision mediump float;

            uniform mat4 uMatrix;

            attribute vec3 aVertexPosition;
            attribute vec2 aVertexTextureUv;

            varying vec2 vTextureCoordinates;

            void main( void ) {
                vTextureCoordinates = vec2( aVertexTextureUv.s, aVertexTextureUv.t );
                gl_Position = uMatrix * vec4( aVertexPosition, 1.0 );
            }

        `

    } ); }

}
