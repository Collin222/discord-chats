declare module 'snowflake-id' {
	export default class SnowflakeId {
		constructor(options?: { mid?: number; offset?: number });

        generate(): string;
	}
}
