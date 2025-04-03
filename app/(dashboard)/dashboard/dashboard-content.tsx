"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, CreditCard, RefreshCw } from "lucide-react";
import type { ChatMessage } from "@/lib/types/chat";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chat } from "@/components/ui/chat";
import { getChatHistory } from "./actions";

interface DashboardContentProps {
	team: {
		id: number;
		name: string;
		subscriptionStatus: string | null;
		planName: string | null;
	} | null;
}

export default function DashboardContent({ team }: DashboardContentProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

	useEffect(() => {
		if (team) {
			setIsLoading(true);
			loadChatHistory()
				.catch((error) => {
					console.error("Error loading data:", error);
					setError("Failed to load data");
				})
				.finally(() => setIsLoading(false));
		}
	}, [team]);

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
				{/* Simple Subscription Status */}
				<Card className="p-4 col-span-full">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CreditCard className="h-5 w-5 text-blue-600" />
							<div>
								<h2 className="font-medium">
									{team?.subscriptionStatus === "active"
										? "Active Plan"
										: "Free Plan"}
								</h2>
								<p className="text-sm text-gray-500">
									{team?.planName || "Basic Features"}
								</p>
							</div>
						</div>
						{team?.subscriptionStatus !== "active" && (
							<Button>Upgrade Plan</Button>
						)}
					</div>
				</Card>

				{/* AI Chat Section - More Compact */}
				<div className="lg:col-span-2">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-semibold">Family AI Assistant</h2>
					</div>

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
				</div>

				{/* Important Dates & Events */}
				<Card className="p-4">
					<h3 className="font-medium mb-2">Important Dates</h3>
					<p className="text-sm text-gray-500">No upcoming events</p>
				</Card>

				{/* Family Documents */}
				<Card className="p-4">
					<h3 className="font-medium mb-2">Family Documents</h3>
					<p className="text-sm text-gray-500">No documents uploaded</p>
				</Card>

				{/* Tasks & Reminders */}
				<Card className="p-4">
					<h3 className="font-medium mb-2">Tasks & Reminders</h3>
					<p className="text-sm text-gray-500">No tasks assigned</p>
				</Card>

				{/* Family Memories */}
				<Card className="p-4">
					<h3 className="font-medium mb-2">Family Memories</h3>
					<p className="text-sm text-gray-500">No memories added</p>
				</Card>
			</div>
		</div>
	);
}
