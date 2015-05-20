# PProcjs

PProcjs is an ES6 library used to add shader support to [Start9](http://start9.io) (via a WebGL canvas).

This library should be modulable enough to be used in any type of WebGL application. Check the [demo](http://start9.github.io/pprocjs/example/) to see it in action. Feel free to make a PR if you ported a new interesting shader.

## Example

```js
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
    screen.containmentPass,
    new CrtLottesShader( )
] );

( function render( ) {
    requestAnimationFrame( render );
    screen.flushScreen( );
} )( );
```

## License

The library itself is MIT licensed. Start9 has no copyright over the shaders (unless specified otherwise), which are published under their own respective licenses. Check their files for more information.
