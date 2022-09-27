import {GLSLDataSet} from './WebglType';
// import {Dictionary} from 'typescript-collections';
import {GetImagePromise} from './UtilityFunc';

class WebglUtility {

    //textureCache : Dictionary<string, HTMLImageElement>;

    constructor() {
        //this.textureCache = new Dictionary();
    }

    async GetGLBFile(glb_path: string) {
        let glbRequest = new Request(glb_path);
        let promiseBlob = await fetch(glbRequest)
                    .then((response) => response.blob())
                    .then((myBlob) => {
                        return myBlob;
                    });
        
        return new Promise( resolve => {
            let reader = new FileReader() ;
            reader.onload = function(){ resolve(this.result) } ;
            reader.readAsDataURL(promiseBlob);
            return reader;
        });
    }

    async GetVertFragShader(vertFilePath: string, fragFilePath: string) {
        let VertPros = fetch(vertFilePath, {method: 'GET', credentials: 'include'});
        let FragPros = fetch(fragFilePath, {method: 'GET', credentials: 'include'});
    
        return Promise.all([VertPros, FragPros ])
        .then( responses =>
            Promise.all(
                [responses[0].text(), responses[1].text()]
            )
        ).then((values) => {
            let gLSLDataSet : GLSLDataSet = {
                vertex_shader : values[0],
                fragment_shader : values[1],
            };

            return gLSLDataSet; 
        });
    }

    async GetImage(path : string) : Promise<HTMLImageElement> {

        // if (this.textureCache.containsKey(path)) {
        //     return this.textureCache.getValue(path);
        // }

        let texture = await GetImagePromise(path);
        //this.textureCache.setValue(path, texture);

        return texture;         
    }
}

export default WebglUtility;