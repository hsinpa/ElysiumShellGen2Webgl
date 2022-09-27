export function SetDomInputValue(inputName : string, callback : (x : number) => void ): number {
    let inputDom : any = document.querySelector(`input[name='${inputName}']`);
    let sliderLabel: any = document.querySelector(`label[name='${inputName}']`);

    let template = sliderLabel.innerHTML + " {0}";
    inputDom.addEventListener("input", (e : any) => {
        sliderLabel.innerHTML = template.replace("{0}", e.target.value);

        callback(parseFloat(e.target.value));
    });

    sliderLabel.innerHTML = template.replace("{0}", inputDom.value);
    callback(parseFloat(inputDom.value));

    return parseFloat(inputDom.value);
}

export function ListenInputChange(inputName : string, callback : (string : number) => void ): string {
    let inputDom : any = document.querySelector(`input[name='${inputName}']`);

    inputDom.addEventListener("input", (e : any) => {
        callback((e.target.value));
    });

    return (inputDom.value);
}

export function Lerp( v0 : number,  v1 : number,  t : number) {
    return (1 - t) * v0 + t * v1;
}

export function GetImagePromise(imagePath : string) {
    return new Promise<HTMLImageElement>( resolve => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.src = imagePath;
        im.onload = () => resolve(Object.assign(im));

        return im;
    });
}

export function GetRandomRange(min:number, max:number) {
    return Math.random() * (max - min) + min;
}

export function DoDelayAction(time : number) : Promise<void> {
    return new Promise(function (resolve, reject) {
        let flag = false;
        (
            function waitForFoo(){

                if (flag) return resolve();

                flag = true;
                setTimeout(waitForFoo, time);
        })();
    });

}