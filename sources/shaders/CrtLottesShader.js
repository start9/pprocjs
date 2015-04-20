import { Shader } from './Shader';

export class CrtLottesShader extends Shader {

    constructor( options ) { super( Object.assign( {

        fragment : `

        //
        // PUBLIC DOMAIN CRT STYLED SCAN-LINE SHADER
        //
        //   by Timothy Lottes
        //
        // This is more along the style of a really good CGA arcade monitor.
        // With RGB inputs instead of NTSC.
        // The shadow mask example has the mask rotated 90 degrees for less chromatic aberration.
        //
        // Left it unoptimized to show the theory behind the algorithm.
        //
        // It is an example what I personally would want as a display option for pixel art games.
        // Please take and use, change, or whatever.
        //

        precision mediump float;

        #ifndef CRT_SCANLINE_HARDNESS
        #define CRT_SCANLINE_HARDNESS -8.0
        #endif

        #ifndef CRT_PIXEL_HARDNESS
        #define CRT_PIXEL_HARDNESS -3.0
        #endif

        #ifndef CRT_MASK_DARK
        #define CRT_MASK_DARK 0.7
        #endif

        #ifndef CRT_MASK_LIGHT
        #define CRT_MASK_LIGHT 1.5
        #endif

        uniform sampler2D uInputSampler;
        uniform vec2 uInputResolution;

        varying vec2 vTextureCoordinates;

        // Optimize for resize.
        vec2 res = uInputResolution / 6.0;

        //------------------------------------------------------------------------

        // sRGB to Linear.
        // Assuing using sRGB typed textures this should not be needed.
        float ToLinear1 ( float c ) { return ( c <= 0.04045 ) ? c / 12.92 : pow( ( c + 0.055 ) / 1.055, 2.4 ); }
        vec3  ToLinear  ( vec3 c )  { return vec3( ToLinear1( c.r ), ToLinear1( c.g ), ToLinear1( c.b ) ); }

        // Linear to sRGB.
        // Assuing using sRGB typed textures this should not be needed.
        float ToSrgb1 (float c) { return ( c < 0.0031308 ? c * 12.92 : 1.055 * pow( c, 0.41666 ) - 0.055 ); }
        vec3  ToSrgb  (vec3 c)  { return vec3( ToSrgb1( c.r ), ToSrgb1( c.g ), ToSrgb1( c.b ) ); }

        // Nearest emulated sample given floating point position and texel offset.
        // Also zero's off screen.
        vec3 Fetch( vec2 pos, vec2 off )
        {
            return ToLinear( texture2D( uInputSampler, pos ).rgb );
        }

        // Distance in emulated pixels to nearest texel.
        vec2 Dist( vec2 pos )
        {
            pos = pos * res;
            return - ( ( pos - floor( pos ) ) - vec2( 0.5 ) );
        }

        // 1D Gaussian.
        float Gaus( float pos, float scale )
        {
            return exp2( scale * pos * pos );
        }

        // 3-tap Gaussian filter along horz line.
        vec3 Horz3( vec2 pos, float off )
        {
            vec3 b = Fetch( pos, vec2( -1.0, off ) );
            vec3 c = Fetch( pos, vec2(  0.0, off ) );
            vec3 d = Fetch( pos, vec2(  1.0, off ) );

            float dst = Dist( pos ).x;
            float scale = CRT_PIXEL_HARDNESS;

            // Convert distance to weight.
            float wb = Gaus( dst - 1.0, scale );
            float wc = Gaus( dst + 0.0, scale );
            float wd = Gaus( dst + 1.0, scale );

            // Return filtered sample.
            return ( b * wb + c * wc + d * wd ) / ( wb + wc + wd );
        }

        // 5-tap Gaussian filter along horz line.
        vec3 Horz5( vec2 pos, float off )
        {
            vec3 a = Fetch( pos, vec2( -2.0, off ) );
            vec3 b = Fetch( pos, vec2( -1.0, off ) );
            vec3 c = Fetch( pos, vec2(  0.0, off ) );
            vec3 d = Fetch( pos, vec2(  1.0, off ) );
            vec3 e = Fetch( pos, vec2(  2.0, off ) );

            float dst = Dist( pos ).x;
            float scale = CRT_PIXEL_HARDNESS;

            // Convert distance to weight.
            float wa = Gaus( dst - 2.0, scale );
            float wb = Gaus( dst - 1.0, scale );
            float wc = Gaus( dst + 0.0, scale );
            float wd = Gaus( dst + 1.0, scale );
            float we = Gaus( dst + 2.0, scale );

            // Return filtered sample.
            return ( a * wa + b * wb + c * wc + d * wd + e * we ) / ( wa + wb + wc + wd + we );
        }

        // Return scanline weight.
        float Scan( vec2 pos, float off )
        {
            float dst = Dist( pos ).y;
            return Gaus( dst + off, CRT_SCANLINE_HARDNESS );
        }

        // Allow nearest three lines to effect pixel.
        vec3 Tri( vec2 pos )
        {
            vec3 a = Horz3( pos, -1.0 );
            vec3 b = Horz5( pos,  0.0 );
            vec3 c = Horz3( pos,  1.0 );

            float wa = Scan( pos, -1.0 );
            float wb = Scan( pos,  0.0 );
            float wc = Scan( pos,  1.0 );

            return a * wa + b * wb + c * wc;
        }

        // Shadow mask.
        vec3 Mask( vec2 pos )
        {
            vec3 mask = vec3( CRT_MASK_DARK, CRT_MASK_DARK, CRT_MASK_DARK );
            pos.x += pos.y * 3.0;
            pos.x = fract( pos.x / 6.0 );

            if ( pos.x < 0.333 ) {
                mask.r = CRT_MASK_LIGHT;
            } else if ( pos.x < 0.666 ) {
                mask.g = CRT_MASK_LIGHT;
            } else {
                mask.b = CRT_MASK_LIGHT;
            }

            return mask;
        }

        // Entry.
        void main( void ) {
            gl_FragColor = vec4( Tri( vTextureCoordinates ) * Mask( vTextureCoordinates * uInputResolution ), 1.0 );
            gl_FragColor.rgb = ToSrgb( gl_FragColor.rgb );
        }

        `

    }, options ) ); }

}
