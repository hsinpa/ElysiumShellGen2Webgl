export const BackgroundPostProcessingFrag : string = `
    in vec2 vUV;
    
    uniform float u_aspect_ratio;
    uniform sampler2D u_mainTex;

    void main() {
        float uv_x = clamp(((vUV.x - 0.5)* u_aspect_ratio) + 0.5, 0.01, 0.99);
        vec2 resize_uv = vec2(uv_x, vUV.y ); 

        vec4 bg_texture = texture2D(u_mainTex, resize_uv);
        gl_FragColor = bg_texture; 
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

        if ((front_texture.r > 0.0001 || front_texture.g > 0.0001 || front_texture.b > 0.0001) && front_texture.w > 0.001) {

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
    
    void main() {
        vec4 front_texture = texture2D(textureSampler, vUV);
        vec4 background_texture = texture2D(u_backgroundTex, vUV);

        float frame_uv_x = (vUV.x * u_aspect_ratio);
        float frame_uv_remaining =  (u_aspect_ratio - 1.0) * 0.5;
        float frame_uv_hide =  ( 1.0 - u_aspect_ratio_revert) * 0.5 ;

        frame_uv_x = frame_uv_x - frame_uv_remaining;
        vec4 frame_texture = texture2D(u_frameTex, vec2(frame_uv_x, vUV.y));
        vec4 frame_corner_col = texture2D(u_frameTex, vec2(0.1, 0.1));
        vec4 black_col = vec4(0.0, 0.0, 0.0, 1.0);

        if (vUV.x < frame_uv_hide || vUV.x > 1.0 - frame_uv_hide) {
            gl_FragColor = black_col;

            return;
        }

        if (frame_texture.a > 0.5) {
            gl_FragColor = frame_texture;

            return;
        }

        vec4 final_output = mix(background_texture, front_texture, front_texture.w);

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