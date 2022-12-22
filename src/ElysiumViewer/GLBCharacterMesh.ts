import { AbstractMesh } from "@babylonjs/core/Meshes";

export default class GLBCharacterMesh {
    m_meshs: AbstractMesh[];

    constructor(mesh: AbstractMesh[]) {
        this.m_meshs = mesh;
    }

    public get IsValid() {return this.m_meshs != null }

    public get GetMainMesh() {return this.m_meshs.find(x=> x.name != "__root__" && x.skeleton != null); }

    IteratorOps(ops : (mesh: AbstractMesh) => void) {
        if (!this.IsValid || ops == null) return;

        let meshLength = this.m_meshs.length;
        for (let i = 0; i < meshLength; i++) {
            ops(this.m_meshs[i]);
        }
    }
}