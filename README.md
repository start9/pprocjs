# PProcjs

PProcjs is an ES6 library used to add shader support to [Start9](http://start9.io) (via a WebGL canvas).

This library should be modulable enough to be used in any type of WebGL application. Check the [demo](http://start9.github.io/pprocjs/example/) to see it in action. Feel free to make a PR if you ported a new interesting shader.

## Example

```js
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
```

## License

The library itself is MIT licensed. Start9 has no copyright over the shaders (unless specified otherwise), which are published under their own respective licenses. Check their files for more information.
