import { ContainmentShader }   from '../sources/shaders/ContainmentShader';
import { CrtLottesShader }     from '../sources/shaders/CrtLottesShader';
import { XbrLv3Shader }        from '../sources/shaders/XbrLv3Shader';
import { Pipeline }            from '../sources/Pipeline';

function run( image ) {

    let canvas = document.createElement( 'canvas' );

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    document.body.appendChild( canvas );

    let gl = canvas.getContext( 'webgl' );

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

    let pipeline = new Pipeline( gl );
    pipeline.entry.setInputSize( image.width, image.height );
    pipeline.entry.setInputData( gl.RGBA, gl.UNSIGNED_BYTE, image.data );

    pipeline.push( new XbrLv3Shader( ) );

    let containmentPass = pipeline.push( new ContainmentShader( ) );
    containmentPass.setOutputSize( canvas.width, canvas.height );

    pipeline.push( new CrtLottesShader( ) );

    ( function render( ) {
        requestAnimationFrame( render );
        gl.clear( gl.COLOR_BUFFER_BIT );
        pipeline.render( );
    } )( );

}

function importImageData( image ) {

    let canvas = document.createElement( 'canvas' );
    let context = canvas.getContext( '2d' );

    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage( image, 0, 0 );

    let canvasData = context.getImageData( 0, 0, canvas.width, canvas.height ).data;
    let pixelData = image.data = new Uint8Array( canvasData.length );

    for ( let t = 0; t < pixelData.length; ++ t ) {
        pixelData[ t ] = canvasData[ t ];
    }

}

function loadImage( src ) {

    return new Promise( ( resolve, reject ) => {

        let image = new Image( );
        image.crossOrigin = 'anonymous';
        image.src = src;

        image.addEventListener( 'load', ( ) => {
            importImageData( image );
            resolve( image );
        } );

        image.addEventListener( 'error', ( error ) => {
            reject( error );
        } );

    } );

}

export default function ( ) {

    return loadImage( 'http://i.imgur.com/xUm3XMz.png' ).then( image => {
        return run( image );
    } );

}
