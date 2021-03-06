
function deeplyEquals(node1, node2, allowIdentical=true){
    if(typeof(node1) != typeof(node2)){
        return false // nodes not same type
    }
    else if (node1 instanceof Object){
        if(node1 === node2 && !allowIdentical){
            return false // identical object
        }else{
            for (var k in node1){
                if(!(k in node2)){
                    return false; // key in node1 but node node2
                }
            }
            for (var q in node2){
                if(!(q in node1)){
                    return false;// key in node2 and not node1
                }else if(!deeplyEquals(node1[q], node2[q], allowIdentical)){
                        return false; //recursive came up false.
                }
            }
            return true; // no false flag
        }
    } else {
        return (node1 === node2); ///primitive equality
    }
}

function deeplyEqualsThrow(node1, node2, derefstack, seen, allowIdentical=true){
    var derefstack = derefstack || [];
    var seen = seen || []

    //circularity prevention
    if(seen.indexOf(node1) !== -1 || seen.indexOf(node2) !== -1){
        return
    }

    if(typeof(node1) != typeof(node2)){
        throw new Error(`nodes not same type, derefs: [${derefstack}],  node1:${node1} of type ${typeof(node1)}, node2:${node2} of type ${typeof(node2)}`)
    }
    else if (node1 instanceof Object){
        if(node1 === node2 && !allowIdentical){
            throw new Error(`identical object not replica, derefs:[${derefstack}]`)
        }else{
            for (let k in node1){
                if(!(k in node2)){
                    throw new Error(`key ${k} in object1 but not object2, derefs:[${derefstack}]`)
                }
            }
            for (let q in node2){
                if(!(q in node1)){
                    throw new Error(`key ${q} in object2 but not object1, derefs:[${derefstack}]`)// key in node2 and not node1
                }else{
                    deeplyEqualsThrow(node1[q], node2[q], derefstack.concat(q), seen.concat(node1, node2), allowIdentical)
                }
            }
            return true; // no false flag
        }
    } else if(node1 !== node2){
        throw new Error(`Terminals: "${node1}" and "${node2}" not equal, derefs:[${derefstack}]`)
    }
}


const Astro = require('../astroduct.js');
const B = Astro.B;

describe('Tree reduction', function(){

    //pending("removal of logs and use")

    let defaults = {
        a:{
            alpha:'a',
            beta:'b'
        },
        b:[2,3,5],
        c:{
            x:2,
            y:"everafter",
            z:'too much'
        }
    }

    let data = {
        a:{
            alpha:'actual',
            beta:'belt'
        },
        b:[7,11,13],
        c:{
            x:2,
            y:['twaddle']
        }
    }

    let expected = {
        a:{
            alpha:'actual',
            beta:'belt'
        },
        b:[2,3,5,7,11,13],
        c:{
            x:4,
            y:'everafter["twaddle"]',
            z:'too much'
        }
    }

    let blender = B({
        b:B([],{
            term:true,
            reduce(a,b){return a.concat(b)}
        }),
        c:{
            x(a, b){return a+b},
            y:B(undefined,{
                term:true,
                map(x){return JSON.stringify(x)},
                reduce(a, b){return a+b}
            })
        }
    },{
        map(x, churn){
            //console.log("base mapper:",x)
            return x
        }
    });

    it('should reduce',function(){
        blender.init(defaults);
        let actual = blender.blend(data).dump();

        // console.log('actual result:', actual);
        // console.log('expected result:', expected);

        deeplyEqualsThrow(expected, actual);
    })

    it('should add properties', ()=>{
        var b = B();
        b.blend({a:0});
        expect(b.dump()).toEqual({a:0});
    })

    it('should not clobber with nothing',function(){
        var b = B()
            .init({a:0})
            .blend(undefined)
            .blend({})
            .blend({a:undefined})

        expect(b.dump()).toEqual({a:0});
    })

    it('should not ruin arrays', function(){
        var b = B()
            .init([])

        expect(b.dump() instanceof Array).toBeTruthy();

        b.init(undefined)
            .blend([])


        expect(b.dump() instanceof Array).toBeTruthy();

        b.blend([2,[]]);

        expect(b.dump() instanceof Array).toBeTruthy();

        b.blend({0:"c"})
        expect(b.dump() instanceof Array).toBeTruthy();

    })

    it('should override primative values', function(){
        expect(B().init(1).blend(2).dump()).toBe(2)

        let b = B()
            .init({a:1})

        expect(b.dump().a).toBe(1)

        b.blend({a:2})
        expect(b.dump().a).toBe(2)

    })

})
