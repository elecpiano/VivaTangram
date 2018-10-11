
export default class Dictionary<KT, VT> {
    private keys: KT[] = [];	
    private values: VT[] = [];	
    public constructor() {}

    Add(key: any, value: any){
        this.keys.push(key);
        this.values.push(value);
    }

    Remove(key: any) {
        let index = this.keys.indexOf(key, 0);
        this.keys.splice(index, 1);	
        this.values.splice(index, 1);
    }

    TryGetValue(key: KT): VT {
        var index = this.keys.indexOf(key, 0);
        // console.log("xxx key : " + key);
        // console.log("xxx keys : " + this.keys.length + "/" + this.keys);
        // console.log("xxx index : " + index);
        if (index != -1) {
            return this.values[index];
        }
        return null;
    }

    ContainsKey(key: any): boolean {
        let ks = this.keys;
        for (let i = 0; i < ks.length; ++i) {
            if (ks[i] == key) {
                return true;
            }
        }	
        return false;
    }

    SetValue(key: any, value: any): boolean {
        var index = this.keys.indexOf(key, 0);
        if (index != -1) {
            this.keys[index] = key;
            this.values[index] = value;		
            return true;
            }	
        return false;
    }

    GetKeys(): KT[] {	
        return this.keys;
    }
    
    GetValues(): VT[] {	
        return this.values;
    }   

}


