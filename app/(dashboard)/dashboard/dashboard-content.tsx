"use client";

import { CreditCard, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listSubscriptions } from "@/lib/actions/familySubscriptions";
import { FamilySubscription } from "@/lib/db/schema";

interface DashboardContentProps {
	team: {
		id: number;
		name: string;
		subscriptionStatus: string | null;
		planName: string | null;
	} | null;
}

export default function DashboardContent({ team }: DashboardContentProps) {
	const [subscriptions, setSubscriptions] = useState<FamilySubscription[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);

	useEffect(() => {
		const fetchSubscriptions = async () => {
			const result = await listSubscriptions();
			if (result.success) {
				setSubscriptions(result.data);
				// Calculate total monthly cost
				const total = result.data.reduce((sum, sub) => {
					return sum + parseFloat(sub.monthlyCost ?? '0');
				}, 0);
				setTotalMonthlyCost(total);
			}
			setLoading(false);
		};
		fetchSubscriptions();
	}, []);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Subscription Status Card */}
				<Card className="col-span-full">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CreditCard className="h-5 w-5 text-blue-600" />
								<div>
									<CardTitle className="text-lg">
										{team?.subscriptionStatus === "active" ? "Active Plan" : "Free Plan"}
									</CardTitle>
									<CardDescription>
										{team?.planName || "Basic Features"}
									</CardDescription>
								</div>
							</div>
							{team?.subscriptionStatus !== "active" && (
								<Button variant="default">Upgrade Plan</Button>
							)}
						</div>
					</CardHeader>
				</Card>

				{/* Total Monthly Cost Card */}
				<Card className="col-span-full">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							<CardTitle className="text-lg">Monthly Subscriptions</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center h-24">
								<Skeleton className="h-12 w-32" />
							</div>
						) : (
							<div className="flex items-center justify-center h-24">
								<div className="text-center">
									<p className="text-3xl font-bold">${totalMonthlyCost.toFixed(2)}</p>
									<p className="text-sm text-gray-500">Total Monthly Cost</p>
								</div>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button variant="default" size="sm" onClick={() => window.location.href = '/dashboard/family/subscriptions'}>
							Manage Subscriptions
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
