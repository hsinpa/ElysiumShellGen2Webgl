export const EventTag = Object.freeze({
    BabylonAppReady: "event@app_ready",
    BabylonAppDisplay: "event@app_display"
});

export const MaterialParameters = Object.freeze({ 
    MainTex: "u_mainTex",
    MainBackground: "u_mainBG",

    AspectRatio: "u_aspect_ratio",
    AspectRatioRevert: "u_aspect_ratio_revert",
    AlignHeightFlag: "u_align_height", 

    BackgroundColor: "u_background_color",
    EnablePureBGColor: "u_enable_background_color",
    
    BackgroundTex: "u_backgroundTex",
    NoiseTex: "u_noiseTex",
    FrameTex: "u_frameTex",
    Strength: "u_strength",
});

export const TexturePath = Object.freeze({
    GDN: ".\\textures\\race_background\\BG_GDN-min.jpg",
    IVD: ".\\textures\\race_background\\BG_IVD-min.jpg",
    ORC: ".\\textures\\race_background\\BG_ORC-min.jpg",
    OTL: ".\\textures\\race_background\\BG_OTL-min.jpg",
    ARC: ".\\textures\\race_background\\BG_ARC-min.jpg",
    TTN: ".\\textures\\race_background\\BG_TTN-min.jpg",

    Website_GDN: ".\\textures\\website_race_background\\GDN-min.png",
    Website_IVD: ".\\textures\\website_race_background\\IVD-min.png",
    Website_ORC: ".\\textures\\website_race_background\\ORC-min.png",
    Website_OTL: ".\\textures\\website_race_background\\OTL-min.png",
    Website_ARC: ".\\textures\\website_race_background\\ARC-min.png",

    Website_Mobile_GDN: ".\\textures\\website_race_background\\mobile-GDN-min.png",
    Website_Mobile_IVD: ".\\textures\\website_race_background\\mobile-IVD-min.png",
    Website_Mobile_ORC: ".\\textures\\website_race_background\\mobile-ORC-min.png",
    Website_Mobile_OTL: ".\\textures\\website_race_background\\mobile-OTL-min.png",
    Website_Mobile_ARC: ".\\textures\\website_race_background\\mobile-ARC-min.png",

    Website_BG: ".\\textures\\website_race_background\\background_min.jpg",

    NoiseTexture: ".\\textures\\displacement_noise.jpg",
    FrameDefaultTexture: ".\\textures\\frame\\raw\\frame-1-min.png",
    FrameBaseTexture: ".\\textures\\frame\\raw\\",

    TransparentGround: ".\\textures\\backgroundGround.png",
    TransparentGround_02: ".\\textures\\backgroundGround_02.png",
    TransparentGround_x5: ".\\textures\\backgroundGround_x5.png",
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

export const API = Object.freeze({
    metadata: "https://api.elysiumshell.xyz/esnxm/:id",
    gateway: "https://elysiumshell.mypinata.cloud/ipfs/:id"
});

export const AnimationSet = Object.freeze({
    Idle : "idle.glb",
});

export const String = Object.freeze({
    IPFS_GLB_NOT_EXIST : "Assembly is in progress,<br> please wait a moment",
    WEBSITE_MODE : "website",
});

export interface OpenseaTraitType {
    trait_type: string,
    value: string,
};

export interface OpenseaDataType {
    code: string,
    glb: string,
    id: string
}

export interface WebsiteOption {
    mode: string,
    is_website: boolean,
    is_mobile: boolean,
    background: string,
    id: string
}