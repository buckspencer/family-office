"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, CreditCard, RefreshCw, Calendar, FileText, CheckSquare, Image, DollarSign } from "lucide-react";
import type { ChatMessage } from "@/lib/types/chat";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Chat } from "@/components/ui/chat";
import { getChatHistory } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardContentProps {
	team: {
		id: number;
		name: string;
		subscriptionStatus: string | null;
		planName: string | null;
	} | null;
}

interface PaymentInfo {
	id: string;
	amount: number;
	date: Date;
	status: 'upcoming' | 'paid' | 'failed';
	description: string;
}

export default function DashboardContent({ team }: DashboardContentProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [upcomingPayments, setUpcomingPayments] = useState<PaymentInfo[]>([]);
	const [isLoadingPayments, setIsLoadingPayments] = useState(false);

	useEffect(() => {
		if (team) {
			setIsLoading(true);
			loadChatHistory()
				.catch((error) => {
					console.error("Error loading data:", error);
					setError("Failed to load data");
				})
				.finally(() => {
					setIsLoading(false);
					setIsInitialLoad(false);
				});
			
			// Load upcoming payments
			loadUpcomingPayments();
		}
	}, [team]);

	// Load upcoming payments
	const loadUpcomingPayments = async () => {
		if (!team) return;
		
		setIsLoadingPayments(true);
		try {
			// This would be replaced with an actual API call
			// For now, we'll use mock data
			const mockPayments: PaymentInfo[] = [
				{
					id: '1',
					amount: 49.99,
					date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
					status: 'upcoming',
					description: 'Monthly subscription renewal'
				},
				{
					id: '2',
					amount: 149.99,
					date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
					status: 'upcoming',
					description: 'Quarterly plan upgrade'
				}
			];
			
			setUpcomingPayments(mockPayments);
		} catch (error) {
			console.error("Error loading upcoming payments:", error);
		} finally {
			setIsLoadingPayments(false);
		}
	};

	// Set up data refresh based on changes
	useEffect(() => {
		if (!team) return;

		let lastMessageCount = messages.length;
		let lastMessageUpdate = new Date();

		const checkForUpdates = async () => {
			try {
				// Check messages
				const history = await getChatHistory(team.id.toString());
				if (history.length !== lastMessageCount || 
					history.some((msg, index) => {
						const currentMessage = messages[index];
						if (!currentMessage) return true;
						const currentTimestamp = new Date(msg.timestamp).getTime();
						const previousTimestamp = currentMessage.timestamp.getTime();
						return currentTimestamp !== previousTimestamp;
					})) {
					const formattedMessages = history.map((msg) => {
						const message: ChatMessage = {
							role: msg.role === "system" ? "assistant" : (msg.role as "user" | "assistant"),
							content: msg.message,
							timestamp: new Date(msg.timestamp),
						};

						if (msg.status === "error" || msg.error) {
							message.isError = true;
						}

						return message;
					});

					setMessages(formattedMessages);
					lastMessageCount = history.length;
					lastMessageUpdate = new Date();
				}
			} catch (error) {
				console.error("Error checking for updates:", error);
			}
		};

		// Check for updates every 5 seconds
		const intervalId = setInterval(checkForUpdates, 5000);

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, [team, messages]);

	const loadChatHistory = async () => {
		if (!team) return;
		try {
			const history = await getChatHistory(team.id.toString());
			console.log("Loaded chat history:", history);

			// Create a new array of messages with proper formatting
			const formattedMessages = history.map((msg) => {
				const message: ChatMessage = {
					role:
						msg.role === "system"
							? "assistant"
							: (msg.role as "user" | "assistant"),
					content: msg.message,
					timestamp: new Date(msg.timestamp),
				};

				// Add error status if message has an error
				if (msg.status === "error" || msg.error) {
					message.isError = true;
				}

				return message;
			});

			// Force a state update with the new array
			setMessages([...formattedMessages]);
		} catch (error) {
			console.error("Error loading chat history:", error);
			setError("Failed to load chat history");
		}
	};

	const handleSendMessage = async (message: string) => {
		if (!team) return;

		// Clear any previous errors
		setError(null);

		try {
			setIsLoading(true);

			// Add the user's message immediately for better UX
			const userMessage: ChatMessage = {
				role: "user",
				content: message,
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);

			// Send the message to the API
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message,
					context: {
						teamId: team.id,
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.error || `Failed to send message: ${response.status}`
				);
			}

			const data = await response.json();

			// Add the AI's response
			const aiMessage: ChatMessage = {
				role: "assistant",
				content: data.message,
				timestamp: new Date(),
			};

			// Use a function to update state to ensure we're working with the latest state
			setMessages((prevMessages) => {
				// Filter out any temporary messages
				const filteredMessages = prevMessages.filter(
					(m) =>
						!(
							m.role === "user" &&
							m.content === message &&
							// Check if timestamps are close (within 5 seconds)
							Math.abs(
								m.timestamp.getTime() - userMessage.timestamp.getTime()
							) < 5000
						)
				);

				// Return a new array with the user message and AI response
				return [...filteredMessages, userMessage, aiMessage];
			});

			// Force a re-render by updating the lastUpdate timestamp
			setLastUpdate(new Date());

			// Force a refresh of the chat history after a short delay
			setTimeout(() => {
				loadChatHistory();
			}, 500);
		} catch (error) {
			console.error("Error sending message:", error);

			// Add an error message to the chat
			const errorMessage: ChatMessage = {
				role: "assistant",
				content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
				timestamp: new Date(),
				isError: true,
			};

			// Use a function to update state to ensure we're working with the latest state
			setMessages((prevMessages) => {
				// Return a new array with the error message added
				return [...prevMessages, errorMessage];
			});

			// Force a re-render
			setLastUpdate(new Date());

			// Refresh data after an error to ensure UI is up-to-date
			loadChatHistory();

			setError("Failed to process your message. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

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

				{/* Subscription Summary Card */}
				<Card className="col-span-full">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-green-600" />
								<CardTitle className="text-lg">Subscription Summary</CardTitle>
							</div>
							<Button variant="ghost" size="icon" onClick={() => loadUpcomingPayments()}>
								<RefreshCw className="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{isLoadingPayments ? (
							<div className="space-y-4">
								<Skeleton className="h-12 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						) : upcomingPayments.length > 0 ? (
							<div className="space-y-4">
								{upcomingPayments.map((payment) => (
									<div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<p className="font-medium">{payment.description}</p>
											<p className="text-sm text-gray-500">
												Due: {payment.date.toLocaleDateString()}
											</p>
										</div>
										<div className="text-right">
											<p className="font-medium">${payment.amount.toFixed(2)}</p>
											<p className={`text-xs ${
												payment.status === 'upcoming' ? 'text-blue-500' : 
												payment.status === 'paid' ? 'text-green-500' : 'text-red-500'
											}`}>
												{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-gray-500">No upcoming payments</p>
						)}
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" size="sm">View Billing History</Button>
						<Button variant="default" size="sm">Manage Payment Methods</Button>
					</CardFooter>
				</Card>

				{/* AI Chat Section */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl">Family AI Assistant</CardTitle>
								<Button variant="ghost" size="icon" onClick={() => loadChatHistory()}>
									<RefreshCw className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{error && (
								<Alert variant="destructive" className="mb-4">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="rounded-lg border bg-white shadow-sm p-4 h-[400px]">
								<Chat
									messages={messages}
									isLoading={isLoading}
									onSendMessage={handleSendMessage}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Important Dates & Events */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-600" />
							<CardTitle className="text-lg">Important Dates</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						{isInitialLoad ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						) : (
							<p className="text-sm text-gray-500">No upcoming events</p>
						)}
					</CardContent>
				</Card>

				{/* Family Documents */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-blue-600" />
							<CardTitle className="text-lg">Family Documents</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						{isInitialLoad ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						) : (
							<p className="text-sm text-gray-500">No documents uploaded</p>
						)}
					</CardContent>
				</Card>

				{/* Tasks & Reminders */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<CheckSquare className="h-5 w-5 text-blue-600" />
							<CardTitle className="text-lg">Tasks & Reminders</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						{isInitialLoad ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						) : (
							<p className="text-sm text-gray-500">No tasks assigned</p>
						)}
					</CardContent>
				</Card>

				{/* Family Memories */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Image className="h-5 w-5 text-blue-600" />
							<CardTitle className="text-lg">Family Memories</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						{isInitialLoad ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						) : (
							<p className="text-sm text-gray-500">No memories added</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
