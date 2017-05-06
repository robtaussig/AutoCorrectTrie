module.exports =  class WordPriority {
    constructor() {
        this.closenessMap = {
            a: {x:1,y:0}, b: {x:2,y:4}, c: {x:2,y:2}, d: {x:1,y:2}, e: {x:0,y:2}, 
            f: {x:1,y:3}, g: {x:1,y:4}, h: {x:1,y:5}, i: {x:0,y:7}, j: {x:1,y:6}, 
            k: {x:1,y:7}, l: {x:1,y:8}, m: {x:2,y:6}, n: {x:2,y:5}, o: {x:0,y:8}, 
            p: {x:0,y:9}, q: {x:0,y:0}, r: {x:0,y:3}, s: {x:1,y:1}, t: {x:0,y:4}, 
            u: {x:0,y:6}, v: {x:2,y:3}, w: {x:0,y:1}, x: {x:2,y:1}, y: {x:0,y:5}, 
            z: {x:2,y:0}
        };
    }
};