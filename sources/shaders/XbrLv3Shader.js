import { Shader } from './Shader';

export class XbrLv3Shader extends Shader {

    constructor( options ) { super( Object.assign( {

        OUTPUT_FACTOR : 4,

        fragment : `

        //
        // Hyllian's xBR-lv3 Shader
        //
        // Copyright (C) 2011/2014 Hyllian/Jararaca - sergiogdb@gmail.com
        //
        // This program is free software; you can redistribute it and/or
        // modify it under the terms of the GNU General Public License
        // as published by the Free Software Foundation; either version 2
        // of the License, or (at your option) any later version.
        //
        // This program is distributed in the hope that it will be useful,
        // but WITHOUT ANY WARRANTY; without even the implied warranty of
        // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        // GNU General Public License for more details.
        //
        // You should have received a copy of the GNU General Public License
        // along with this program; if not, write to the Free Software
        // Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
        //
        //
        //
        // Incorporates some of the ideas from SABR shader. Thanks to Joshua Street.
        //

        precision mediump float;

        #ifndef XBR_Y_WEIGHT
        #define XBR_Y_WEIGHT 48.0
        #endif

        #ifndef XBR_U_WEIGHT
        #define XBR_U_WEIGHT 6.0
        #endif

        #ifndef XBR_V_WEIGHT
        #define XBR_V_WEIGHT 2.0
        #endif

        #ifndef XBR_EQ_THRESHOLD
        #define XBR_EQ_THRESHOLD 10.0
        #endif

        #ifndef XBR_EQ_THRESHOLD2
        #define XBR_EQ_THRESHOLD2 2.0
        #endif

        #ifndef XBR_LV2_COEFFICIENT
        #define XBR_LV2_COEFFICIENT 2.0
        #endif

        uniform sampler2D uInputSampler;
        uniform vec2 uInputResolution;

        varying vec2 vTextureCoordinates;

        mat3 yuv = mat3( 0.299, 0.587, 0.114, -0.169, -0.331, 0.499, 0.499, -0.418, -0.0813 );
        mat3 weightedYuv = mat3( XBR_Y_WEIGHT * yuv[ 0 ], XBR_U_WEIGHT * yuv[ 1 ], XBR_V_WEIGHT * yuv[ 2 ] );
        vec4 delta = vec4( 0.4, 0.4, 0.4, 0.4 );

        vec4 df( vec4 A, vec4 B )
        {
            return abs( A - B );
        }

        float c_df( vec3 c1, vec3 c2 )
        {
            vec3 df = abs( c1 - c2 );
            return df.r + df.g + df.b;
        }

        bvec4 eq( vec4 A, vec4 B )
        {
            return lessThan( df( A, B ), vec4( XBR_EQ_THRESHOLD ) );
        }

        bvec4 eq2( vec4 A, vec4 B )
        {
            return lessThan( df( A, B ), vec4( XBR_EQ_THRESHOLD2 ) );
        }

        vec4 weightedDistance( vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h )
        {
            return df( a, b ) + df( a, c ) + df( d, e ) + df( d, f ) + 4.0 * df( g, h );
        }

        void main( void )
        {
            bvec4 edr, edrLeft, edrUp, edr3Left, edr3Up, px;
            bvec4 interpRestrictionLv1, interpRestrictionLv2Left, interpRestrictionLv2Up;
            bvec4 interpRestrictionLv3Left, interpRestrictionLv3Up;
            bvec4 nc, nc30, nc60, nc45, nc15, nc75;
            vec4 fx, fxLeft, fxUp, finalFx, fx3Left, fx3Up;
            vec3 res1, res2, pix1, pix2;
            float blend1, blend2;

            vec2 fp = fract( vTextureCoordinates * uInputResolution );

            vec2 dx = vec2( 1.0 / uInputResolution.x, 0.0 );
            vec2 dy = vec2( 0.0, 1.0 / uInputResolution.y );

            vec3 A1 = texture2D( uInputSampler, vTextureCoordinates       -dx   -2.0*dy ).rgb;
            vec3 B1 = texture2D( uInputSampler, vTextureCoordinates             -2.0*dy ).rgb;
            vec3 C1 = texture2D( uInputSampler, vTextureCoordinates       +dx   -2.0*dy ).rgb;

            vec3 A  = texture2D( uInputSampler, vTextureCoordinates       -dx       -dy ).rgb;
            vec3 B  = texture2D( uInputSampler, vTextureCoordinates                 -dy ).rgb;
            vec3 C  = texture2D( uInputSampler, vTextureCoordinates       +dx       -dy ).rgb;

            vec3 D  = texture2D( uInputSampler, vTextureCoordinates       -dx           ).rgb;
            vec3 E  = texture2D( uInputSampler, vTextureCoordinates                     ).rgb;
            vec3 F  = texture2D( uInputSampler, vTextureCoordinates       +dx           ).rgb;

            vec3 G  = texture2D( uInputSampler, vTextureCoordinates       -dx       +dy ).rgb;
            vec3 H  = texture2D( uInputSampler, vTextureCoordinates                 +dy ).rgb;
            vec3 I  = texture2D( uInputSampler, vTextureCoordinates       +dx       +dy ).rgb;

            vec3 G5 = texture2D( uInputSampler, vTextureCoordinates       -dx   +2.0*dy ).rgb;
            vec3 H5 = texture2D( uInputSampler, vTextureCoordinates             +2.0*dy ).rgb;
            vec3 I5 = texture2D( uInputSampler, vTextureCoordinates       +dx   +2.0*dy ).rgb;

            vec3 A0 = texture2D( uInputSampler, vTextureCoordinates   -2.0*dx       -dy ).rgb;
            vec3 D0 = texture2D( uInputSampler, vTextureCoordinates   -2.0*dx           ).rgb;
            vec3 G0 = texture2D( uInputSampler, vTextureCoordinates   -2.0*dx       +dy ).rgb;

            vec3 C4 = texture2D( uInputSampler, vTextureCoordinates  +2.0*dx        -dy ).rgb;
            vec3 F4 = texture2D( uInputSampler, vTextureCoordinates  +2.0*dx            ).rgb;
            vec3 I4 = texture2D( uInputSampler, vTextureCoordinates  +2.0*dx        +dy ).rgb;

            vec4 b = vec4( weightedYuv[ 0 ] * mat3( B, D, H ), dot( weightedYuv[ 0 ], F ) );
            vec4 c = vec4( weightedYuv[ 0 ] * mat3( C, A, G ), dot( weightedYuv[ 0 ], I ) );
            vec4 e = vec4( weightedYuv[ 0 ] * mat3( E, E, E ), dot( weightedYuv[ 0 ], E ) );
            vec4 d = b.yzwx;
            vec4 f = b.wxyz;
            vec4 g = c.zwxy;
            vec4 h = b.zwxy;
            vec4 i = c.wxyz;

            vec4 i4 = vec4( weightedYuv[ 0 ] * mat3( I4, C1, A0 ), dot( weightedYuv[ 0 ], G5 ) );
            vec4 i5 = vec4( weightedYuv[ 0 ] * mat3( I5, C4, A1 ), dot( weightedYuv[ 0 ], G0 ) );
            vec4 h5 = vec4( weightedYuv[ 0 ] * mat3( H5, F4, B1 ), dot( weightedYuv[ 0 ], D0 ) );
            vec4 f4 = h5.yzwx;

            vec4 c1 = i4.yzwx;
            vec4 g0 = i5.wxyz;
            vec4 b1 = h5.zwxy;
            vec4 d0 = h5.wxyz;

            vec4 Ao = vec4( 1.0, -1.0, -1.0,  1.0 );
            vec4 Bo = vec4( 1.0,  1.0, -1.0, -1.0 );
            vec4 Co = vec4( 1.5,  0.5, -0.5,  0.5 );
            vec4 Ax = vec4( 1.0, -1.0, -1.0,  1.0 );
            vec4 Bx = vec4( 0.5,  2.0, -0.5, -2.0 );
            vec4 Cx = vec4( 1.0,  1.0, -0.5,  0.0 );
            vec4 Ay = vec4( 1.0, -1.0, -1.0,  1.0 );
            vec4 By = vec4( 2.0,  0.5, -2.0, -0.5 );
            vec4 Cy = vec4( 2.0,  0.0, -1.0,  0.5 );

            vec4 Az = vec4( 6.0, -2.0, -6.0,  2.0 );
            vec4 Bz = vec4( 2.0,  6.0, -2.0, -6.0 );
            vec4 Cz = vec4( 5.0,  3.0, -3.0, -1.0 );
            vec4 Aw = vec4( 2.0, -6.0, -2.0,  6.0 );
            vec4 Bw = vec4( 6.0,  2.0, -6.0, -2.0 );
            vec4 Cw = vec4( 5.0, -1.0, -3.0,  3.0 );

            // These inequations define the line below which interpolation occurs.
            fx      = ( Ao * fp.y + Bo * fp.x );
            fxLeft  = ( Ax * fp.y + Bx * fp.x );
            fxUp    = ( Ay * fp.y + By * fp.x );
            fx3Left = ( Az * fp.y + Bz * fp.x );
            fx3Up   = ( Aw * fp.y + Bw * fp.x );

            interpRestrictionLv1.x = ( ( e.x != f.x ) && ( e.x != h.x ) );
            interpRestrictionLv1.y = ( ( e.y != f.y ) && ( e.y != h.y ) );
            interpRestrictionLv1.z = ( ( e.z != f.z ) && ( e.z != h.z ) );
            interpRestrictionLv1.w = ( ( e.w != f.w ) && ( e.w != h.w ) );

            interpRestrictionLv2Left.x = ( ( e.x != g.x ) && ( d.x != g.x ) );
            interpRestrictionLv2Up.x   = ( ( e.x != c.x ) && ( b.x != c.x ) );

            interpRestrictionLv2Left.y = ( ( e.y != g.y ) && ( d.y != g.y ) );
            interpRestrictionLv2Up.y   = ( ( e.y != c.y ) && ( b.y != c.y ) );

            interpRestrictionLv2Left.z = ( ( e.z != g.z ) && ( d.z != g.z ) );
            interpRestrictionLv2Up.z   = ( ( e.z != c.z ) && ( b.z != c.z ) );

            interpRestrictionLv2Left.w = ( ( e.w != g.w ) && ( d.w != g.w ) );
            interpRestrictionLv2Up.w   = ( ( e.w != c.w ) && ( b.w != c.w ) );

            bvec4 eq2gg0 = eq2( g, g0 );
            bvec4 eq2cc1 = eq2( c, c1 );
            bvec4 eq2d0g0 = eq2( d0, g0 );
            bvec4 eq2b1c1 = eq2( b1, c1 );

            interpRestrictionLv3Left.x = ( eq2gg0.x && ! eq2d0g0.x );
            interpRestrictionLv3Up.x   = ( eq2cc1.x && ! eq2b1c1.x );

            interpRestrictionLv3Left.y = ( eq2gg0.y && ! eq2d0g0.y );
            interpRestrictionLv3Up.y   = ( eq2cc1.y && ! eq2b1c1.y );

            interpRestrictionLv3Left.z = ( eq2gg0.z && ! eq2d0g0.z );
            interpRestrictionLv3Up.z   = ( eq2cc1.z && ! eq2b1c1.z );

            interpRestrictionLv3Left.w = ( eq2gg0.w && ! eq2d0g0.w );
            interpRestrictionLv3Up.w   = ( eq2cc1.w && ! eq2b1c1.w );

            vec4 fx45 = smoothstep( Co - delta, Co + delta, fx );
            vec4 fx30 = smoothstep( Cx - delta, Cx + delta, fxLeft );
            vec4 fx60 = smoothstep( Cy - delta, Cy + delta, fxUp );
            vec4 fx15 = smoothstep( Cz - delta, Cz + delta, fx3Left );
            vec4 fx75 = smoothstep( Cw - delta, Cw + delta, fx3Up );

            bvec4 fx45B = bvec4( fx45 );
            bvec4 fx30B = bvec4( fx30 );
            bvec4 fx60B = bvec4( fx60 );
            bvec4 fx15B = bvec4( fx15 );
            bvec4 fx75B = bvec4( fx75 );

            vec4 w1 = weightedDistance( e, c, g, i, h5, f4, h, f );
            vec4 w2 = weightedDistance( h, d, i5, f, i4, b, e, i );

            vec4 dffg = df( f, g );
            vec4 dfhc = df( h, c );

            vec4 dffgC = dffg * XBR_LV2_COEFFICIENT;
            vec4 dfhcC = dfhc * XBR_LV2_COEFFICIENT;

            edr.x     = ( w1.x < w2.x ) && interpRestrictionLv1.x;
            edrLeft.x = ( dffgC.x <= dfhc.x ) && interpRestrictionLv2Left.x;
            edrUp.x   = ( dfhcC.x <= dffg.x ) && interpRestrictionLv2Up.x;

            edr.y     = ( w1.y < w2.y ) && interpRestrictionLv1.y;
            edrLeft.y = ( dffgC.y <= dfhc.y ) && interpRestrictionLv2Left.y;
            edrUp.y   = ( dfhcC.y <= dffg.y ) && interpRestrictionLv2Up.y;

            edr.z     = ( w1.z < w2.z ) && interpRestrictionLv1.z;
            edrLeft.z = ( dffgC.z <= dfhc.z ) && interpRestrictionLv2Left.z;
            edrUp.z   = ( dfhcC.z <= dffg.z ) && interpRestrictionLv2Up.z;

            edr.w     = ( w1.w < w2.w ) && interpRestrictionLv1.w;
            edrLeft.w = ( dffgC.w <= dfhc.w ) && interpRestrictionLv2Left.w;
            edrUp.w   = ( dfhcC.w <= dffg.w ) && interpRestrictionLv2Up.w;

            edr3Left = interpRestrictionLv3Left;
            edr3Up   = interpRestrictionLv3Up;

            nc45.x = ( edr.x &&              fx45B.x );
            nc30.x = ( edr.x && edrLeft.x && fx30B.x );
            nc60.x = ( edr.x && edrUp.x   && fx60B.x );
            nc15.x = ( edr.x && edrLeft.x && fx15B.x && edr3Left.x );
            nc75.x = ( edr.x && edrUp.x   && fx75B.x && edr3Up.x );

            nc45.y = ( edr.y &&              fx45B.y );
            nc30.y = ( edr.y && edrLeft.y && fx30B.y );
            nc60.y = ( edr.y && edrUp.y   && fx60B.y );
            nc15.y = ( edr.y && edrLeft.y && fx15B.y && edr3Left.y );
            nc75.y = ( edr.y && edrUp.y   && fx75B.y && edr3Up.y );

            nc45.z = ( edr.z &&              fx45B.z );
            nc30.z = ( edr.z && edrLeft.z && fx30B.z );
            nc60.z = ( edr.z && edrUp.z   && fx60B.z );
            nc15.z = ( edr.z && edrLeft.z && fx15B.z && edr3Left.z );
            nc75.z = ( edr.z && edrUp.z   && fx75B.z && edr3Up.z );

            nc45.w = ( edr.w &&              fx45B.w );
            nc30.w = ( edr.w && edrLeft.w && fx30B.w );
            nc60.w = ( edr.w && edrUp.w   && fx60B.w );
            nc15.w = ( edr.w && edrLeft.w && fx15B.w && edr3Left.w );
            nc75.w = ( edr.w && edrUp.w   && fx75B.w && edr3Up.w );

            px = lessThan( df( e, f ), df( e, h ) );

            nc.x = ( nc75.x || nc15.x || nc30.x || nc60.x || nc45.x );
            nc.y = ( nc75.y || nc15.y || nc30.y || nc60.y || nc45.y );
            nc.z = ( nc75.z || nc15.z || nc30.z || nc60.z || nc45.z );
            nc.w = ( nc75.w || nc15.w || nc30.w || nc60.w || nc45.w );

            vec4 final45 = vec4( nc45 ) * fx45;
            vec4 final30 = vec4( nc30 ) * fx30;
            vec4 final60 = vec4( nc60 ) * fx60;
            vec4 final15 = vec4( nc15 ) * fx15;
            vec4 final75 = vec4( nc75 ) * fx75;

            vec4 maximo = max( max( max( final15, final75 ), max( final30, final60 ) ), final45 );

                 if ( nc.x ) { pix1 = px.x ? F : H; blend1 = maximo.x; }
            else if ( nc.y ) { pix1 = px.y ? B : F; blend1 = maximo.y; }
            else if ( nc.z ) { pix1 = px.z ? D : B; blend1 = maximo.z; }
            else if ( nc.w ) { pix1 = px.w ? H : D; blend1 = maximo.w; }

                 if ( nc.w ) { pix2 = px.w ? H : D; blend2 = maximo.w; }
            else if ( nc.z ) { pix2 = px.z ? D : B; blend2 = maximo.z; }
            else if ( nc.y ) { pix2 = px.y ? B : F; blend2 = maximo.y; }
            else if ( nc.x ) { pix2 = px.x ? F : H; blend2 = maximo.x; }

            res1 = mix( E, pix1, blend1 );
            res2 = mix( E, pix2, blend2 );

            vec3 res = mix( res1, res2, step( c_df( E, res1 ), c_df( E, res2 ) ) );

            gl_FragColor = vec4( res, 1.0 );
        }

        `

    }, options ) ); }

}
