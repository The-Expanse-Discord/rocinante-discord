/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Command } from '../Infrastructure/System';

export class System {
	public static getNonNull(jsonObject: {[key: string]: string}, key: string): string {
		if (!(key in jsonObject)) {
			throw new Error(`Missing required configuration key: ${ key }`);
		}

		return jsonObject[key];
	}

	public static flattenArray<T>(array: (T | T[])[]): T[] {
		const result: T[] = [];

		for (const item of array) {
			if (item instanceof Array) {
				result.push(...this.flattenArray(item));
			} else {
				result.push(item);
			}
		}

		return result;
	}

	public static findCommandClasses(obj: any): any {
		const foundClasses: Command[] = [];
		const keys: string[] = Object.keys(obj);

		if (Command.prototype.isPrototypeOf(obj.prototype)) {
			foundClasses.push(obj);
		} else if (keys.length > 0) {
			for (const key of keys) {
				if (Command.prototype.isPrototypeOf(obj[key].prototype)) {
					foundClasses.push(this.findCommandClasses(obj[key]));
				}
			}
		}

		return this.flattenArray(foundClasses);
	}
}
