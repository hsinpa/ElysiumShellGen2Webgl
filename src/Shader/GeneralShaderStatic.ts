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
    uniform sampler2D u_depthTex;
    uniform float u_aspect_ratio;

    uniform float u_strength;

    void main() {
        vec4 front_texture = texture2D(textureSampler, vUV);
        vec4 noise_texture = texture2D(u_noiseTex, vec2(vUV.x * 5.0 * u_aspect_ratio, vUV.y * 5.0 ));
        vec4 depth_texture = texture2D(u_depthTex, vUV);

        vec4 col = front_texture;
        vec4 borderCol = vec4(0.3, 0.6, 0.9, 1.0);
        float diff = abs(u_strength - noise_texture.r);
        gl_FragColor = vec4(depth_texture.r, depth_texture.r, depth_texture.r, 1.0);

        if ((front_texture.r > 0.0001 || front_texture.g > 0.0001 || front_texture.b > 0.0001) && front_texture.w > 0.001) {

            if (noise_texture.g < u_strength) {
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