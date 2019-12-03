/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-prototype-builtins */

import { Command } from '../classes/Command';

export class Util {
	/**
	 * Flatten an array that may contain nested arrays.
	 *
	 * @param array - The array to flatten
	 *
	 * @returns - The flattened array.
	 */
	public static flattenArray<T>(array: (T | T[])[]): T[] {
		const result: T[] = [];

		for (const item of array)
			if (item instanceof Array)
				result.push(...Util.flattenArray(item));
			else
				result.push(item);

		return result;
	}

	/**
	 * Recursively search for Command classes within the given object.
	 *
	 * @param obj - The object to search for Command classes in.
	 *
	 * @returns - The flattened array of found Command classes.
	 */
	public static findCommandClasses(obj: any): any {
		const foundClasses: Command[] = [];
		const keys: string[] = Object.keys(obj);

		if (Command.prototype.isPrototypeOf(obj.prototype))
			foundClasses.push(obj);
		else if (keys.length > 0)
			for (const key of keys)
				if (Command.prototype.isPrototypeOf(obj[key].prototype))
					foundClasses.push(this.findCommandClasses(obj[key]));

		return Util.flattenArray(foundClasses);
	}
}
