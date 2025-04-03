import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ChatMessage } from "@/lib/types/chat";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatProps {
	messages: ChatMessage[];
	onSendMessage: (message: string) => Promise<void>;
	isLoading?: boolean;
}

export function Chat({
	messages,
	onSendMessage,
	isLoading = false,
}: ChatProps) {
	const [input, setInput] = useState("");
	const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		// Always update when messages array changes
		if (messages && messages.length > 0) {
			// Sort messages by timestamp in ascending order (oldest first)
			const sortedMessages = [...messages].sort(
				(a, b) => a.timestamp.getTime() - b.timestamp.getTime()
			);

			// Check if messages have actually changed to avoid unnecessary re-renders
			const hasChanged =
				sortedMessages.length !== localMessages.length ||
				sortedMessages.some((msg, idx) => {
					if (idx >= localMessages.length) return true;
					return msg.content !== localMessages[idx].content;
				});

			if (hasChanged) {
				// Update the local messages
				setLocalMessages(sortedMessages);

				// Force scroll to bottom after a short delay to ensure DOM has updated
				const timer = setTimeout(() => {
					scrollToBottom();
				}, 100);

				return () => clearTimeout(timer);
			}
		}
	}, [messages, localMessages]);

	const scrollToBottom = () => {
		if (messagesContainerRef.current) {
			const scrollHeight = messagesContainerRef.current.scrollHeight;
			const height = messagesContainerRef.current.clientHeight;
			const maxScrollTop = scrollHeight - height;
			messagesContainerRef.current.scrollTop =
				maxScrollTop > 0 ? maxScrollTop : 0;

			// Double-check scroll position after a short delay
			setTimeout(() => {
				if (messagesContainerRef.current) {
					const newScrollHeight = messagesContainerRef.current.scrollHeight;
					const newHeight = messagesContainerRef.current.clientHeight;
					const newMaxScrollTop = newScrollHeight - newHeight;
					messagesContainerRef.current.scrollTop =
						newMaxScrollTop > 0 ? newMaxScrollTop : 0;
				}
			}, 50);
		}

		// Also try to scroll to the end ref if it exists
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	useEffect(() => {
		// Scroll to bottom whenever messages change
		scrollToBottom();
	}, [localMessages]);

	// Also scroll to bottom when loading state changes
	useEffect(() => {
		if (!isLoading) {
			// Small delay to ensure DOM has updated
			const timer = setTimeout(() => {
				scrollToBottom();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isLoading]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await onSendMessage(input.trim());
			setInput("");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div
				ref={messagesContainerRef}
				className="flex-1 overflow-y-auto p-4 space-y-4"
			>
				{localMessages.map((message, index) => (
					<div
						key={index}
						className={`flex ${
							message.role === "user" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-[80%] rounded-lg p-3 ${
								message.role === "user"
									? "bg-primary text-primary-foreground"
									: message.isError
										? "bg-red-100 text-red-800 border border-red-200"
										: "bg-muted"
							}`}
						>
							{message.isError && (
								<div className="flex items-center mb-2">
									<AlertCircle className="h-4 w-4 mr-2 text-red-600" />
									<span className="font-medium text-red-600">Error</span>
								</div>
							)}
							<div className="prose prose-sm dark:prose-invert max-w-none">
								{message.content.split("\n").map((line, i) => (
									<p key={i} className="mb-1 last:mb-0">
										{line.startsWith("- ") ? (
											<span className="block pl-4">• {line.slice(2)}</span>
										) : line.match(/^\d+\. /) ? (
											<span className="block pl-4">{line}</span>
										) : line.match(/\*\*(.*?)\*\*/) ? (
											<span
												dangerouslySetInnerHTML={{
													__html: line.replace(
														/\*\*(.*?)\*\*/g,
														"<strong>$1</strong>"
													),
												}}
											/>
										) : (
											line
										)}
									</p>
								))}
							</div>
						</div>
					</div>
				))}
				{isLoading && (
					<div className="flex justify-start">
						<div className="max-w-[80%] rounded-lg p-3 bg-muted">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
								<div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
								<div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="flex-shrink-0 border-t bg-background p-4">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type your message..."
						disabled={isSubmitting || isLoading}
					/>
					<Button type="submit" disabled={isSubmitting || isLoading}>
						Send
					</Button>
				</form>
			</div>
		</div>
	);
}
