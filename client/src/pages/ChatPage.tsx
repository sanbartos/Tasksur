import { useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, MessageCircle, Clock } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: {
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  };
}

interface UserSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  isOnline?: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const otherUserId = params.userId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Cargar información del otro usuario
  useEffect(() => {
    async function fetchOtherUser() {
      try {
        const res = await apiRequest("GET", `/api/users/${otherUserId}`);
        const data = await res.json();
        setOtherUser(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        });
      }
    }
    
    if (otherUserId) {
      fetchOtherUser();
    }
  }, [otherUserId, toast]);

  // Cargar mensajes entre user.id y otherUserId
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await apiRequest("GET", `/api/messages/conversation?user1=${user?.id}&user2=${otherUserId}`);
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user && otherUserId) {
      fetchMessages();
    }
  }, [user, otherUserId, toast]);

  // Scroll al final cuando cambian mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !otherUserId) return;
    
    try {
      const messageToSend = {
        senderId: user.id,
        receiverId: otherUserId,
        content: newMessage.trim(),
      };
      
      // Agregar mensaje localmente para feedback inmediato
      const tempMessage: Message = {
        id: Date.now(),
        ...messageToSend,
        createdAt: new Date().toISOString(),
        sender: {
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      // Enviar al servidor
      await apiRequest("POST", "/api/messages", messageToSend);
      
      // Recargar mensajes para obtener el ID real
      const res = await apiRequest("GET", `/api/messages/conversation?user1=${user.id}&user2=${otherUserId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
      // Remover mensaje temporal en caso de error
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: es });
    } else if (isYesterday(date)) {
      return "Ayer";
    } else {
      return format(date, "dd/MM/yyyy", { locale: es });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherUser?.profileImageUrl ?? undefined} />
              <AvatarFallback className="bg-primary text-white">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {otherUser?.firstName} {otherUser?.lastName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>En línea</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{messages.length} mensajes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-140px)]">
        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-4 bg-white rounded-lg shadow-sm">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aún no hay mensajes</h3>
              <p className="text-gray-500 max-w-md">
                Empieza la conversación enviando un mensaje a {otherUser?.firstName}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs md:max-w-md lg:max-w-lg ${msg.senderId === user?.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"} rounded-2xl px-4 py-3`}>
                  <div className="flex items-start gap-2">
                    {msg.senderId !== user?.id && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.sender?.profileImageUrl ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`text-xs mt-1 ${msg.senderId === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                        {formatDate(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-grow">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Escribe un mensaje a ${otherUser?.firstName}...`}
                  onKeyDown={handleKeyPress}
                  className="min-h-[44px] resize-none"
                  disabled={!user}
                />
              </div>
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || !user}
                className="bg-primary hover:bg-primary/90 h-11 w-11 p-0"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Presiona Enter para enviar</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(), "HH:mm", { locale: es })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




