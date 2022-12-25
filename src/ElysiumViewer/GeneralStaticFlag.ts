export const EventTag = Object.freeze({
    BabylonAppReady: "event@app_ready"
});

export const MaterialParameters = Object.freeze({ 
    MainTex: "u_mainTex",
    AspectRatio: "u_aspect_ratio",
    AspectRatioRevert: "u_aspect_ratio_revert",

    BackgroundTex: "u_backgroundTex",
    NoiseTex: "u_noiseTex",
    FrameTex: "u_frameTex",
    Strength: "u_strength",
});

export const TexturePath = Object.freeze({
    BG_GDN: ".\\textures\\race_background\\BG_GDN-min.jpg",
    BG_IVD: ".\\textures\\race_background\\BG_IVD-min.jpg",
    BG_ORC: ".\\textures\\race_background\\BG_ORC-min.jpg",
    BG_OLW: ".\\textures\\race_background\\BG_OLW-min.jpg",

    NoiseTexture: ".\\textures\\displacement_noise.jpg",

    FrameDefaultTexture: ".\\textures\\frame\\raw\\frame-1-min.png",
    FrameBaseTexture: ".\\textures\\frame\\raw\\",

    TransparentGround: ".\\textures\\backgroundGround.png",
});

export const EmojiTextureArray : string[] = [
    ".\\textures\\emoji\\ESNX dialog 01-min.png",
    ".\\textures\\emoji\\ESNX dialog 02-min.png",
    ".\\textures\\emoji\\ESNX dialog 03-min.png",
    ".\\textures\\emoji\\ESNX dialog 04-min.png",
    ".\\textures\\emoji\\ESNX dialog 05-min.png",
    ".\\textures\\emoji\\ESNX dialog 06-min.png",
    ".\\textures\\emoji\\ESNX dialog 07-min.png",
    ".\\textures\\emoji\\ESNX dialog 08-min.png",
    ".\\textures\\emoji\\ESNX dialog 09-min.png",
    ".\\textures\\emoji\\ESNX dialog 10-min.png"
];

export const AnimationSet = Object.freeze({
    Idle : "idle.glb",
});