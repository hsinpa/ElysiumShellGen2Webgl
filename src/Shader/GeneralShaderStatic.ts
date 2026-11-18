export const BackgroundPostProcessingFrag : string = `
    in vec2 vUV;

    uniform vec3 u_background_color;
    uniform float u_enable_background_color;
    uniform float u_aspect_ratio;
    uniform sampler2D u_mainTex;
    uniform sampler2D u_mainBG;

    void main() {
        float uv_x = clamp(((vUV.x - 0.5)* u_aspect_ratio) + 0.5, 0.01, 0.99);
        vec2 resize_uv = vec2(uv_x, vUV.y ); 

        vec4 main_texture = texture2D(u_mainTex, resize_uv);
        vec4 background_c = texture2D(u_mainBG, vUV);

        main_texture = vec4(mix(background_c.rgb, main_texture.rgb, main_texture.a), 1.0);

        main_texture = mix(main_texture, vec4(u_background_color, 1.0), u_enable_background_color);

        gl_FragColor = main_texture; 
    }
`;

export const ForegroundPostProcessingFrag : string = `
    in vec2 vUV;
    
    uniform sampler2D textureSampler;
    uniform sampler2D u_noiseTex;
    uniform float u_aspect_ratio;

    uniform float u_strength;

    void main() {
        
        float clamp_strength = clamp(u_strength, 0.01, 1.0);
        vec4 front_texture = texture2D(textureSampler, vUV);
        vec4 noise_texture = texture2D(u_noiseTex, vec2(vUV.x * 5.0 * u_aspect_ratio, vUV.y * 5.0 ));
        
        vec4 col = front_texture;
        vec4 borderCol = vec4(0.3, 0.6, 0.9, 1.0);

        float diff = abs(clamp_strength - noise_texture.r);

        if ( front_texture.w > 0.01) {

            if (noise_texture.g < clamp_strength) {
                if (diff < 0.05) {
                    gl_FragColor = borderCol;
                    return;
                }

                gl_FragColor = front_texture;
                return;
            }
        }

        
        discard;
    }
`;

export const FrameDecorationPostProcessingFrag : string = `
    in vec2 vUV;
    
    uniform sampler2D textureSampler;
    uniform sampler2D u_frameTex;
    uniform sampler2D u_backgroundTex;

    uniform float u_aspect_ratio;
    uniform float u_aspect_ratio_revert;
    uniform int u_align_height;
    
    vec4 get_align_width_color(vec2 vUV) {
        float frame_uv_x = (vUV.x * u_aspect_ratio);
        float frame_uv_remaining =  (u_aspect_ratio - 1.0) * 0.5;

        frame_uv_x = frame_uv_x - frame_uv_remaining;
        return texture2D(u_frameTex, vec2(frame_uv_x, vUV.y));  
    }

    vec4 get_align_height_color(vec2 vUV) {
        float frame_uv_y = (vUV.y * u_aspect_ratio_revert);
        float frame_uv_remaining =  (u_aspect_ratio_revert - 1.0) * 0.5;

        frame_uv_y = frame_uv_y - frame_uv_remaining;
        return texture2D(u_frameTex, vec2(vUV.x, frame_uv_y));
    }

    void main() {
        vec4 front_texture = texture2D(textureSampler, vUV);
        vec4 background_texture = texture2D(u_backgroundTex, vUV);

        float frame_uv_width_hide =  ( 1.0 - u_aspect_ratio_revert) * 0.5;
        float frame_uv_height_hide =  ( 1.0 - u_aspect_ratio) * 0.5;

        vec4 frame_texture = vec4(0,0,0,0);
        if (u_align_height == 1) {
            frame_texture = get_align_height_color(vUV);
        } else {
            frame_texture = get_align_width_color(vUV);
        }

        float side_uv = vUV.x;
        float uv_hide = frame_uv_width_hide;
        if (u_align_height == 1)  {
            side_uv = vUV.y;
            uv_hide = frame_uv_height_hide;
        }
        
        vec4 black_col = vec4(0.0, 0.0, 0.0, 1.0);

        if (side_uv < uv_hide || side_uv > 1.0 - uv_hide) {
            gl_FragColor = black_col;

            return;
        }

        if (frame_texture.a > 0.6) {
            gl_FragColor = frame_texture;

            return;
        }

        vec4 final_output = vec4( mix(background_texture.rgb, front_texture.rgb, front_texture.a), 1.0);

        gl_FragColor = final_output;
    }
`;

export const UniversalVert : string = `
    precision mediump float;
    
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;

    uniform mat4 worldViewProjection;

    varying vec2 v_uv;
    varying vec3 v_normal;

    void main () {
    v_uv = uv;
    v_normal = normal;

    gl_Position = worldViewProjection * vec4(position, 1.0);
    }
`;

export const EmojiFrag : string = `
    precision mediump float;
    
    varying vec2 v_uv;
    varying vec3 v_normal;
    
    uniform sampler2D u_mainTex;
    uniform float u_strength;

    void main () {    
        vec4 color = texture2D(u_mainTex, vec2(1.0 - v_uv.x, v_uv.y));
        //vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

        if (color.a < 0.1 || 1.0 - v_uv.y > u_strength)
            discard;

        gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
    }
`;