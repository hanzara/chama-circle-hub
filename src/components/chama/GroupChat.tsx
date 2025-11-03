
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface GroupChatProps {
  chamaData: any;
}

const GroupChat: React.FC<GroupChatProps> = ({ chamaData }) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, connectionStatus, sendTypingIndicator } = useGroupChat(chamaData.id);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    // Send typing indicator (throttled)
    sendTypingIndicator();
  };

  const getSenderName = (message: any) => {
    return message.chama_members?.profiles?.full_name || 
           message.chama_members?.profiles?.email || 
           'Unknown User';
  };

  const isMyMessage = (message: any) => {
    return message.chama_members?.user_id === user?.id;
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Group Chat</h2>
        <p className="text-muted-foreground">Communicate with your chama members in real-time</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {chamaData.name} Chat
            </CardTitle>
            <Badge variant="secondary" className={`flex items-center gap-2 ${getConnectionStatusColor()}`}>
              {getConnectionStatusIcon()}
              {getConnectionStatusText()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ScrollArea className="h-[400px] border rounded-lg p-4 bg-gray-50/50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isFirst = index === 0 || messages[index - 1].chama_members.user_id !== message.chama_members.user_id;
                    const isLast = index === messages.length - 1 || messages[index + 1].chama_members.user_id !== message.chama_members.user_id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
                            isMyMessage(message)
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white border shadow-sm rounded-bl-md'
                          } ${
                            isFirst ? 'mt-2' : ''
                          } ${
                            isLast ? 'mb-2' : ''
                          }`}
                        >
                          {!isMyMessage(message) && isFirst && (
                            <div className="text-xs font-medium mb-2 opacity-75">
                              {getSenderName(message)}
                            </div>
                          )}
                          <div className="text-sm leading-relaxed">{message.message}</div>
                          <div className={`text-xs mt-2 flex justify-end ${
                            isMyMessage(message) ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                placeholder={connectionStatus === 'connected' ? "Type your message..." : "Connecting..."}
                className="flex-1"
                disabled={connectionStatus !== 'connected' || isSending}
                maxLength={1000}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newMessage.trim() || connectionStatus !== 'connected' || isSending}
                className="px-4"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            {newMessage.length > 900 && (
              <p className="text-xs text-muted-foreground text-right">
                {1000 - newMessage.length} characters remaining
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupChat;
