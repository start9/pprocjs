import { VirtjsScreen }        from '../sources/extra/VirtjsScreen';
import { CrtLottesShader }     from '../sources/shaders/CrtLottesShader';
import { XbrLv3Shader }        from '../sources/shaders/XbrLv3Shader';
import { Pipeline }            from '../sources/Pipeline';

function run( image ) {

    let screen = new VirtjsScreen( );
    document.body.appendChild( screen.canvas );

    screen.setInputFormat( {
        depth : 32,
        rMask : 0x00FF0000,
        gMask : 0x0000FF00,
        bMask : 0x000000FF,
        aMask : 0xFF000000
    } );

    screen.setInputSize(
        image.width,
        image.height
    );

    screen.setOutputSize(
        document.body.clientWidth,
        document.body.clientHeight
    );

    screen.setInputData( image.data );

    var [ xbrPass, containmentPass, crtLottesPass ] = screen.applyShaders( [
        new XbrLv3Shader( ),
        new CrtLottesShader( ),
        screen.containmentPass,
    ] );

    ( function render( ) {
        requestAnimationFrame( render );
        screen.flushScreen( );
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
