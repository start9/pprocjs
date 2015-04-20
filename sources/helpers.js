export function createShader( gl, type, script ) {

    let shader = gl.createShader( type );

    gl.shaderSource( shader, script );
    gl.compileShader( shader );

    if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
        throw new Error( `Shader compilation failed: ${gl.getShaderInfoLog(shader)}` );

    return shader;

}

export function createProgram( gl, fragment, vertex ) {

    let program = gl.createProgram( );

    gl.attachShader( program, vertex );
    gl.attachShader( program, fragment );

    gl.linkProgram( program );

    if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) )
        throw new Error( `Shader linking failed: ${gl.getError()}` );

    return program;

}

export function createFramebuffer( gl ) {

    let framebuffer = gl.createFramebuffer( );

    return framebuffer;

}

export function createTexture( gl ) {

    let texture = gl.createTexture( );

    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.bindTexture( gl.TEXTURE_2D, null );

    return texture;

}
