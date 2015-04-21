import { ContainmentShader } from '../shaders/ContainmentShader';
import { Pipeline }          from '../Pipeline';

let gWebGlSupportedInputFormats = [

    { depth : 16, rMask : 0b1111100000000000, gMask : 0b0000011111100000, bMask : 0b0000000000011111, aMask : 0b0000000000000000, _typedView : Uint16Array,
      /* The following is private and shouldn't be used anywhere else */ _format : 'RGB', _type : 'UNSIGNED_SHORT_5_6_5' },

    { depth : 32, rMask : 0x00FF0000, gMask : 0x0000FF00, bMask : 0x000000FF, aMask : 0xFF000000, _typedView : Uint32Array,
      /* The following is private and shouldn't be used anywhere else */ _format : 'RGBA', _type : 'UNSIGNED_BYTE' }

];

function getMatchingInputFormat( { depth, rMask, gMask, bMask, aMask } ) {

    for ( let supported of gWebGlSupportedInputFormats )
        if ( depth === supported.depth && rMask === supported.rMask && gMask === supported.gMask && bMask === supported.bMask && aMask === supported.aMask )
            return supported;

    return null;

}

export class VirtjsScreen {

    constructor( { canvas = document.createElement( 'canvas' ) } = { } ) {

        this.canvas = canvas;

        this.inputWidth = 0;
        this.inputHeight = 0;
        this.inputPitch = 0;

        this.inputFormat = null;
        this.inputData = null;

        this.outputWidth = 0;
        this.outputHeight = 0;

        this.gl = this.canvas.getContext( 'webgl' );
        this.gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
        this.gl.pixelStorei( this.gl.UNPACK_FLIP_Y_WEBGL, true );

        this.pipeline = new Pipeline( this.gl );
        this.containmentPass = this.pipeline.createPass( new ContainmentShader( ) );

        let boundingBox = this.canvas.getBoundingClientRect( );
        let width = boundingBox.width, height = boundingBox.height;

        this.setInputSize( width, height );
        this.setOutputSize( width, height );

    }

    setInputSize( width, height, pitch = width ) {

        if ( width === this.inputWidth && height === this.inputHeight && pitch === this.inputPitch )
            return ;

        this.inputWidth = width;
        this.inputHeight = height;
        this.inputPitch = pitch;

        this._setupAlignmentBuffer( );

        this.pipeline.entry.setInputSize( width, height );

    }

    setOutputSize( width, height ) {

        if ( width === this.outputWidth && height === this.outputHeight )
            return ;

        this.outputWidth = width;
        this.outputHeight = height;

        this.canvas.width = this.outputWidth;
        this.canvas.height = this.outputHeight;

        this.containmentPass.setOutputSize( this.outputWidth, this.outputHeight );

    }

    applyShaders( shaders ) {

        let includesContainmentPass = shaders.indexOf( this.containmentPass ) !== -1;
        let elements = ! includesContainmentPass ? shaders.concat( [ this.containmentPass ] ) : shaders;

        let passes = this.pipeline.applyShaders( elements );

        if ( ! includesContainmentPass )
            passes = passes.slice( 0, passes.length - 1 );

        return passes;

    }

    validateInputFormat( format ) {

        return getMatchingInputFormat( format ) !== null;

    }

    setInputFormat( partialFormat ) {

        let fullFormat = getMatchingInputFormat( partialFormat );

        if ( ! fullFormat )
            throw new Error( 'Invalid input format' );

        this.inputFormat = fullFormat;

        this._setupAlignmentBuffer( );

    }

    setInputData( data ) {

        if ( ! data )
            return ;

        this.inputData = data;

    }

    flushScreen( ) {

        let format = this.gl[ this.inputFormat._format ];
        let type = this.gl[ this.inputFormat._type ];

        this.gl.clear( this.gl.COLOR_BUFFER_BIT );

        this.pipeline.entry.setInputData( format, type, this.inputData );
        this.pipeline.render( );

    }

    _setupAlignmentBuffer( ) {

        if ( ! this.inputFormat )
            return ;

        if ( this.inputPitch === this.inputWidth * this.inputFormat.depth / 8 ) {
            this._alignedData = null;
        } else {
            this._alignedData = new this.inputFormat._typedView( this.inputWidth * this.inputHeight );
        }

    }

    _getAlignedData( ) {

        if ( ! this._alignedData )
            return this.inputData;

        let height = this.inputHeight;
        let byteLength = this.inputFormat.depth / 8;

        let sourceRowSize = this.inputPitch / byteLength;
        let destinationRowSize = this.inputWidth;

        let source = this.inputData;
        let destination = this._alignedData;

        let sourceIndex = 0;
        let destinationIndex = 0;

        for ( let y = 0; y < height; ++ y ) {

            for ( let t = 0; t < destinationRowSize; ++ t )
                destination[ destinationIndex + t ] = source[ sourceIndex + t ];

            sourceIndex += sourceRowSize;
            destinationIndex += destinationRowSize;

        }

        return this._alignedData;

    }

}
