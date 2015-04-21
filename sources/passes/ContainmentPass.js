import { ShaderPass } from './ShaderPass';

function createOrthoMatrix( left, right, bottom, top, near, far ) {

    var lr = 1 / ( left - right ), bt = 1 / ( bottom - top ), nf = 1 / ( near - far );

    return [ - 2 * lr, 0, 0, 0, 0, - 2 * bt, 0, 0, 0, 0, 2 * nf, 0, ( left + right ) * lr, ( bottom + top ) * bt, ( near + far ) * nf, 1 ];

}

export class ContainmentPass extends ShaderPass {

    constructor( gl, shader ) {

        super( gl, shader );

        this.uMatrixLocation = this.gl.getUniformLocation( this.program, 'uMatrix' );

    }

    setOutputSize( width, height ) {

        this.outputWidth = width;
        this.outputHeight = height;

        this.refreshInputs( );

    }

    refreshInputs( { cascade = true } = { } ) {

        super.refreshInputs( { cascade : false } );

        this._refreshMatrix( );

        if ( this.next && cascade ) {
            this.next.refreshInputs( );
        }

    }

    getResolution( ) {

        return { width : this.outputWidth, height : this.outputHeight };

    }

    _refreshMatrix( ) {

        let inputWidth = this.inputs.length > 0 ? this.inputs[ 0 ].resolution.width : 0;
        let inputHeight = this.inputs.length > 0 ? this.inputs[ 0 ].resolution.height : 0;

        let outputWidth = this.output.resolution.width;
        let outputHeight = this.output.resolution.height;

        let isUndefined = value => value == null || value === '';

        if ( isUndefined( outputWidth ) && isUndefined( outputHeight ) )
            outputWidth = inputWidth, outputHeight = inputHeight;

        if ( isUndefined( outputWidth ) )
            outputWidth = inputWidth * ( outputHeight / inputHeight );

        if ( isUndefined( outputHeight ) )
            outputHeight = inputHeight * ( outputWidth / inputWidth );

        let widthRatio = outputWidth / inputWidth;
        let heightRatio = outputHeight / inputHeight;

        let ratio = Math.min( widthRatio, heightRatio );

        let viewportWidth = widthRatio / ratio;
        let viewportHeight = heightRatio / ratio;

        let matrix = createOrthoMatrix( - viewportWidth, viewportWidth, - viewportHeight, viewportHeight, - 100, 100 );

        this.gl.useProgram( this.program );
        this.gl.uniformMatrix4fv( this.uMatrixLocation, false, matrix );
        this.gl.useProgram( null );

    }

}
