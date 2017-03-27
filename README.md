# astroduct

### A Space Age reducer abstraction operating on object algebra and monadic tree destructuring.

## Usage (ES6)

### Install
```bash
    >> npm install --save astroduct
```

### Import
```javascript
    const B = require('astroduct').B;
```


### Basic - works as a nice chained value reducer
```javascript

    let result = B(0, (a,b)=>{return a+b})
        .init(2)
        .blend(2)
        .blend(4)
        .dump();

    // result == 8
```    

### Intermediate - the reducers can be nested

```javascript
    let result = B({
        a:B("The first",{
                map(word){
                    return word + "duct";
                },
                reduce(lastWord, nextWord){
                    return `${lastWord} followed by the ${nextWord}`;
                }
            }
        }),
        b:B(0, {
            map(x){return x + 1},
            reduce(a, b){return Math.abs(a-b)}
        })
    }).init()
    .blend({
        a:"lava",
        b:1
    }).blend({
        a:"astro",
        b:2
    }).dump();

    //result.a == "The first followed by the lava duct followed by the astroduct"

    //Challenge! can you figure out what it is
    //result.b == ?
```

### Want More? Check out the tests

#### Liscence: MIT
