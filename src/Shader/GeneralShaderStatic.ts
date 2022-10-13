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