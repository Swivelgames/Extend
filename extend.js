/**
 * Extend: A Prototype Mix-In Utility
 * 
 * Copyright (c) 2012-2014 Joseph Dalrymple <me@swivel.in>
 *
 **/

/**
 * @class Extend
 * @argument
 * @author Joseph Dalrymple <me@swivel.in>
 */
var Extend = function(ChildClass, ParentClass) {
	var execSuper = false;

	if (!!~["boolean","string"].indexOf(typeof arguments[arguments.length-1])) {
		execParent = Array.prototype.pop.apply(arguments);
	}

	if (arguments.length<2) {
		throw new TypeError("Must supply parent class to extend");
	}

	while (arguments.length > 2) {
		var lastElem = arguments.length - 2,
			superParent = Array.prototype.pop.apply(arguments),
			curParent = arguments[lastElem],
			newParent = Extend(curParent, superParent, execSuper);

		arguments[lastElem] = newParent;
		if (lastElem == 2) {
			ParentClass = newParent;
		}
	}

	var MergedClass = function(){
		if (MergedClass.prototype.execParent===true || MergedClass.prototype.execParent==="before") {
			MergedClass.prototype.parentClass.apply(this,arguments);
		}

		MergedClass.prototype.thisClass.apply(this,arguments);

		if (MergedClass.prototype.execParent==="after") {
			MergedClass.prototype.parentClass.apply(this,arguments);
		}
	};

	Extend.mergeObjects(MergedClass, ChildClass, ParentClass);

	MergedClass.prototype = Extend.mergePrototypes(
		Extend.getPrototype(ChildClass),
		Extend.getPrototype(ParentClass)
	);

	MergedClass.prototype.execParent = execParent;

	if (!!ParentClass.prototype.originClass) {
		MergedClass.prototype.originClass = ParentClass.prototype.originClass;
	} else {
		MergedClass.prototype.originClass = ParentClass;
	}

	MergedClass.prototype.parentClass = ParentClass;
	MergedClass.prototype.thisClass = ChildClass;
	MergedClass.prototype.thisConstructor = MergedClass;

	return MergedClass;
};

Extend.mergeObjects = function(host, obj, obj2, obj3, obj4) {
	if (!host) host = {};

	var l = arguments.length;
	if (l<2) { return host; }

	for (l--;l>0;l--) {
		var nObj = arguments[l];
		if (!(nObj instanceof Object)) {
			throw new TypeError("All arguments must be Objects: "+nObj);
			return undefined;
		}

		Extend.defineProperties(
			host,
			Extend.getObjProperties(
				nObj
			)
		);
	}

	return host;
};

Extend.defineProperties = function(obj, descriptorArr, checkForClass) {
	var objProps = Object.getOwnPropertyNames(obj);

	for (var x in descriptorArr) {
		if (checkForClass && (x=="parentClass"||x=="thisClass")) continue;
		if (!descriptorArr.hasOwnProperty(x)) continue;

		if (objProps.indexOf(x)>-1) {
			var propDesc = Object.getOwnPropertyDescriptor(obj, x);
			if (propDesc.configurable===false) continue;

			if (Extend.isObjectLiteral(propDesc.value) && Extend.isObjectLiteral(descriptorArr[x].value)) {
				descriptorArr[x].value = Extend.mergeObjects({},descriptorArr[x].value,propDesc.value);
			}
		}

		Object.defineProperty(obj, x, descriptorArr[x]);
	}

	return obj;
};

Extend.getObjProperties = function(obj) {
	if (!obj || !(obj instanceof Object)) {
		return [];
	}

	var props = Object.getOwnPropertyNames(obj), // gets non-enumerables
		properties = {};

	for (var i in props) {
		var propName = props[i];

		if (!obj.hasOwnProperty(propName)) continue;

		properties[propName] = Object.getOwnPropertyDescriptor(obj, propName);
	}

	return properties;
};

Extend.getPrototype = function(obj) {
	return Extend.getObjProperties(obj.prototype);
};

Extend.mergePrototypes = function(child, parent) {
	var proto = {};

	if (typeof child != "object" || typeof parent != "object") {
		throw new TypeError("mergePrototypes: All parameters must be objects");
	}

	if(arguments.length > 2 && isNaN(arguments[2])) {
		for (var i=arguments.length;i>1;i--) {
			arguments[i-1] = Extend.mergePrototypes(
				arguments[i-1],
				arguments[i]
			);
		}
	}

	Extend.setProperties(proto, parent);
	Extend.setProperties(proto, child);

	return proto;
};

Extend.setProperties = function(obj, props) {
	return Extend.defineProperties(obj, props, true);
};

Extend.isObjectLiteral = function(obj){
	return (obj && obj.constructor && obj.constructor === Object);
};