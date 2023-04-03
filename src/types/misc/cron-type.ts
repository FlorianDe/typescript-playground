type NamedMonth = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';
type NamedWeekDay = 'sun' | 'mon' | 'tue' |'wed' |'thu' |'fri' |'sat';

type MixedCasings<T extends string> =  Capitalize<Lowercase<T>> | Uppercase<T> | Lowercase<T>

type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type CronMinute = `${0 | Digit}` | `${1 | 2 | 3 | 4 | 5 }${0 | Digit}`;
type CronHour = `${0 | Digit}` | `${1}${0 | Digit}` | `${2}${0|1|2|3}`;
type CronDayMonth = `${Digit}` | `${1|2}${0 | Digit}` | `${3}${0|1}`;

type CronMonth = `${Digit | 10 | 11 | 12}` | MixedCasings<NamedMonth>;
type CronDayWeek = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}` | MixedCasings<NamedWeekDay>;
type CronAnyValue = '*';

type ValidCronFieldSeperatedValues<PossibleValues extends string> = `${PossibleValues},${PossibleValues}` //TODO recursive check

type ValidCronFieldValue<PossibleValues extends string> =
	| PossibleValues
	| CronAnyValue
	| `${CronAnyValue}/${PossibleValues}`

type ValidCronStep<F extends string, PossibleValues extends string> = F extends `${infer A}/${infer B}` ? (
	A extends ValidCronFieldValue<PossibleValues> ? (
		B extends ValidCronFieldSeperatedValues<PossibleValues> ? (
			F
			) : never
		) : never
	) : never

type ValidCronRange<F extends string, PossibleValues extends string> = F extends `${infer A}-${infer B}` ? (
	A extends ValidCronFieldValue<PossibleValues> ? (
		B extends ValidCronFieldSeperatedValues<PossibleValues> ? (
			F
			) : never
		) : never
	) : never

type ValidCronField<F extends string, PossibleValues extends string> = F extends PossibleValues ? F : (
	F extends CronAnyValue ? F : (
		F extends ValidCronStep<F, PossibleValues> ? F : (
			F extends ValidCronRange<F, PossibleValues> ? F : never
			)
		)
	)

export type ValidCronString<T extends string> = T extends `${infer A} ${infer B} ${infer C} ${infer D} ${infer E}`
	?   (A extends ValidCronField<A, CronMinute> ?
		( B extends ValidCronField<B, CronHour> ?
			(C extends ValidCronField<C, CronDayMonth> ?
				(D extends ValidCronField<D, CronMonth> ?
					(E extends ValidCronField<E, CronDayWeek> ? T : never
						) : never
					): never
				): never
			): never
		) : never

/**
 * Example usage:
 * const validCron = asCron('59/2,3 * * * FRI');
 * const invalidCron1 = asCron('a * * * *');
 * const invalidCron2 = asCron('60 * * * *');
 *
 * @param t - cron like string which gets validated
 */
export const asCron = <T extends string>(t: T extends ValidCronString<T> ? T : ValidCronString<T>) => t;

