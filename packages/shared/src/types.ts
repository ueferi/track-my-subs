export interface Subscription {
	id: string;
	name: string;
	price: number;
	currency: string;
	billingCycle: "monthly" | "yearly";
	category: string;
	startDate: Date;
	nextBillingDate: Date;
	isActive: boolean;
}

export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
}
