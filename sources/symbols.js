export var vertexPositionBufferSymbol = Symbol( );
export var vertexTextureUvBufferSymbol = Symbol( );
export var vertexIndexBufferSymbol = Symbol( );

export function importPrivateGlBuffers( gl ) {

    let vertexPositionBuffer = gl[ vertexPositionBufferSymbol ] = gl.createBuffer( );
    let vertexTextureUvBuffer = gl[ vertexTextureUvBufferSymbol ] = gl.createBuffer( );
    let vertexIndexBuffer = gl[ vertexIndexBufferSymbol ] = gl.createBuffer( );

    gl.bindBuffer( gl.ARRAY_BUFFER, vertexPositionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ -1, -1, 0, /**/ 1, -1, 0, /**/ 1, 1, 0, /**/ -1, 1, 0 ] ), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );

    gl.bindBuffer( gl.ARRAY_BUFFER, vertexTextureUvBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ 0, 0, /**/ 1, 0, /**/ 1, 1, /**/ 0, 1 ] ), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( [ 0, 1, 3, 2 ] ), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

}
