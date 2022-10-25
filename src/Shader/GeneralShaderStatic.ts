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
        vec4 front_texture = texture2D(textureSampler, vUV);
        vec4 noise_texture = texture2D(u_noiseTex, vec2(vUV.x * 5.0 * u_aspect_ratio, vUV.y * 5.0 ));

        vec4 col = front_texture;
        vec4 borderCol = vec4(0.3, 0.6, 0.9, 1.0);
        float diff = abs(u_strength - noise_texture.r);

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