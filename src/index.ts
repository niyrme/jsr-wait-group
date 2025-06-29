type Task = {
	promise: Promise<void>;
	resolve(): void;
};

export default class WaitGroup {
	protected readonly tasks: Array<Task> = [];

	constructor(
		/** the capacity of the wait group */
		public readonly limit: number
	) {
		if (limit < 1) {
			throw new Error("limit must be a positive integer");
		}
	}

	/** the current amount of items in the wait group */
	get size(): number {
		return this.tasks.length;
	}

	/** add a new item */
	async add(): Promise<void> {
		if (this.tasks.length >= this.limit) {
			await this.tasks[0]!.promise;
			return this.add();
		}

		let resolve: Task["resolve"] = () => { };
		const promise = new Promise<void>((r) => void (resolve = r));
		this.tasks.push({ resolve, promise });
	}

	/** remove one item */
	done(): void {
		this.tasks.shift()?.resolve();
	}

	/** wait for all remaining items to finish */
	async waitAll(): Promise<void> {
		// loop in case more items get added whilte awaiting current ones
		do {
			await Promise.all(this.tasks.map((task) => task.promise));
		} while (this.size);
	}
}
