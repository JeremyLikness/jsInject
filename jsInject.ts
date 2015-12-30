const maxRecursion: number = 20;

function isArray(arr: any): boolean {
	return Object.prototype.toString.call(arr) === '[object Array]';
}

const ERROR_RECURSION: string = "Maximum recursion at ";
const ERROR_REGISTRATION: string = "Already registered.";
const ERROR_ARRAY: string = "Must pass array.";
const ERROR_FUNCTION: string = "Must pass function to invoke.";
const ERROR_SERVICE: string = "Service does not exist.";

export class JsInject {
	
	public container: {[name: string]: (lvl: number) => any};
	
	constructor() {
		this.container = {};
		this.container["$$jsInject"] = () => this;	
	}
	
	get(name: string, level?: number): any {
		var wrapper: (lvl: number) => any = this.container[name],
			lvl: number = level || 0;
		if (wrapper) {
			return wrapper(lvl);
		}
		throw ERROR_SERVICE;
	}
	
	invoke(fn: Function, deps: string[], instance: any, level: number): any {
		var i: number = 0,
			args: any[] = [],
			lvl: number = level || 0;
		if (lvl > maxRecursion) {
			throw ERROR_RECURSION + lvl;
		}
		for (; i < deps.length; i += 1) {
			args.push(this.get(deps[i], lvl + 1));
		}
		return fn.apply(instance, args);			
	}
	
	register(name: string, annotatedArray: any[]) {
		if (!isArray(annotatedArray)) {
			throw ERROR_ARRAY;
		}
		if (this.container[name]) {
			throw ERROR_REGISTRATION;
		}
		if (typeof annotatedArray[annotatedArray.length - 1] !== 'function') {
			throw ERROR_FUNCTION;
		}
		this.container[name] = (level: number) => {
			var lvl: number = level || 0,
				Template: any = function () {},
				result: any = {},
				instance: any,
				fn: Function = <Function>annotatedArray[annotatedArray.length - 1],
				deps: string[] = annotatedArray.length === 1 ? (annotatedArray[0].$$deps || []) :
					annotatedArray.slice(0, annotatedArray.length - 1),
				injected: any;
			Template.prototype = fn.prototype;
			instance = new Template(),
			injected = this.invoke(fn, deps, instance, lvl + 1);
			result = injected || instance; 
			this.container[name] = () => result;
			return result;
		}
	}
}
