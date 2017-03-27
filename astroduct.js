var Astroduct;
(function (Astroduct) {
    function range() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var beg, end, step;
        switch (args.length) {
            case 1: {
                end = args[0];
                beg = 0;
                step = 1;
                break;
            }
            case 2: {
                end = args[1];
                beg = args[0];
                step = 1;
                break;
            }
            case 3: {
                end = args[2];
                beg = args[0];
                step = args[1];
                break;
            }
            default: {
                end = 0;
                beg = 0;
                step = 1;
                break;
            }
        }
        var rng = [];
        if (beg > end && step < 0) {
            for (var i = beg; i > end; i += step) {
                rng.push(i);
            }
        }
        else if (beg < end && step > 0) {
            for (var i = beg; i < end; i += step) {
                rng.push(i);
            }
        }
        else {
            throw new Error("invalid range parameters");
        }
        return rng;
    }
    Astroduct.range = range;
    function identity(x) {
        return x;
    }
    Astroduct.identity = identity;
    function isPrimative(thing) {
        return thing == undefined || typeof (thing) !== 'object';
    }
    Astroduct.isPrimative = isPrimative;
    function isVanillaObject(thing) {
        return thing instanceof Object && Object.prototype == Object.getPrototypeOf(thing);
    }
    Astroduct.isVanillaObject = isVanillaObject;
    function isVanillaArray(thing) {
        return thing instanceof Array && Array.prototype == Object.getPrototypeOf(thing);
    }
    Astroduct.isVanillaArray = isVanillaArray;
    function typeCaseSplitF(objectOrAllFunction, arrayFunc, primativeFunc) {
        var ofunc, afunc, pfunc;
        if (primativeFunc == undefined && arrayFunc == undefined) {
            ofunc = objectOrAllFunction || identity;
            afunc = objectOrAllFunction || identity;
            pfunc = objectOrAllFunction || identity;
        }
        else {
            ofunc = objectOrAllFunction || identity;
            afunc = arrayFunc || identity;
            pfunc = primativeFunc || identity;
        }
        return function (inThing) {
            var outThing;
            if (isVanillaArray(inThing)) {
                outThing = [];
                outThing.length = inThing.length;
                for (var i = 0; i < inThing.length; i++) {
                    var subBundle = inThing[i];
                    outThing[i] = afunc(subBundle, i);
                }
            }
            else if (isVanillaObject(inThing)) {
                outThing = {};
                for (var k in inThing) {
                    var subBundle = inThing[k];
                    outThing[k] = ofunc(subBundle, k);
                }
            }
            else {
                outThing = pfunc(inThing);
            }
            return outThing;
        };
    }
    Astroduct.typeCaseSplitF = typeCaseSplitF;
    function B(crown, form) {
        if (crown === void 0) { crown = {}; }
        if (form === void 0) { form = {}; }
        return new Blender(crown, form);
    }
    Astroduct.B = B;
    var Blender = (function () {
        function Blender(crown, form) {
            if (form === void 0) { form = {}; }
            this.crown = crown;
            if (form instanceof Function) {
                this.reducer = form;
            }
            else if (form.reduce instanceof Function) {
                this.reducer = form.reduce;
            }
            else {
                this.reducer = Blender.defaultReduce;
            }
            this.block = form.block || false;
            this.term = form.term || false;
            this.mapper = form.map || Blender.defaultMap;
        }
        Blender.defaultReduce = function (a, b) {
            if (Blender.strictTypeReduce && (typeof (a) != typeof (b))) {
                var errmsg = "Expected melding to be the same type \n" +
                    "existing: " + a + "\n" +
                    "incoming: " + b + "\n";
                throw TypeError(errmsg);
            }
            return b === undefined ? a : b;
        };
        ;
        Blender.defaultMap = function (x) {
            return x;
        };
        Blender.prototype.init = function (obj) {
            if (this.term === false) {
                this.crown = typeCaseSplitF(this.initChurn.bind(this))(obj);
            }
            else {
                this.crown = obj;
            }
            return this;
        };
        Blender.prototype.initChurn = function (inner, k) {
            var result;
            if (k === undefined && isPrimative(inner)) {
                result = inner;
                this.term = inner !== undefined;
            }
            else if (k in this.crown) {
                var val = this.crown[k];
                if (val instanceof Blender) {
                    result = val.init(inner);
                }
                else if (val instanceof Function) {
                    result = B(undefined, val).init(inner);
                }
                else {
                    result = B(this.crown[k], { mapper: this.mapper, reducer: this.reducer }).init(inner);
                }
            }
            else {
                result = B(undefined, { mapper: this.mapper, reducer: this.reducer }).init(inner);
            }
            return result;
        };
        Blender.prototype.dump = function () {
            if (this.term) {
                return this.crown;
            }
            else {
                return typeCaseSplitF(function (child) {
                    return child !== undefined ? child.dump() : undefined;
                })(this.crown);
            }
        };
        Blender.prototype.blend = function (obj) {
            this._blend(obj);
            return this;
        };
        Blender.prototype._blend = function (obj) {
            var mapped = this.mapper(obj);
            var reduced;
            if (this.term) {
                reduced = this.reducer(this.crown, mapped);
                this.crown = reduced;
            }
            else {
                reduced = this.merge(mapped);
            }
            return reduced;
        };
        Blender.prototype.merge = function (income) {
            var result, superkeys;
            if (this.crown === undefined && income !== undefined) {
                this.init(income);
                return income;
            }
            else if (income !== undefined) {
                if (this.crown instanceof Array) {
                    result = [];
                    superkeys = range(Math.max((income || []).length || 0, this.crown.length));
                }
                else {
                    result = {};
                    superkeys = Object.keys(this.crown || {});
                    Object.keys(income || {}).forEach(function (key) {
                        if (superkeys.indexOf(key) === -1) {
                            superkeys.push(key);
                        }
                    });
                }
                for (var _i = 0, superkeys_1 = superkeys; _i < superkeys_1.length; _i++) {
                    var key = superkeys_1[_i];
                    if (key in income) {
                        if (key in this.crown) {
                            result[key] = this.crown[key]._blend(income[key]);
                        }
                        else {
                            this.crown[key] = B(undefined, { mapper: this.mapper, reducer: this.reducer }).init(income[key]);
                            result[key] = this.crown[key].dump();
                        }
                    }
                    else if (key in this.crown) {
                        result[key] = this.crown[key].dump();
                    }
                    else {
                    }
                }
                return result;
            }
        };
        return Blender;
    }());
    Blender.strictTypeReduce = false;
    Astroduct.Blender = Blender;
})(Astroduct || (Astroduct = {}));
(function () {
    var root = this;
    var define = define || undefined;
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Astroduct;
        }
        exports.Astroduct = Astroduct;
    }
    else if (typeof define !== 'undefined' && define.amd) {
        define('Astroduct', (function () { return root.Astroduct = Astroduct; })());
    }
    else {
        root.Astroduct = Astroduct;
    }
}).call(this);
