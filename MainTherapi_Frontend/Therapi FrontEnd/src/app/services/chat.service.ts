import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages = new BehaviorSubject<Message[]>([]);
  messages$ = this.messages.asObservable();

  constructor() {}

  async sendMessage(content: string) {
    // Add user message
    this.addMessage({
      content,
      sender: 'user',
      timestamp: new Date()
    });

    // Simulate AI response
    const aiResponse = `I received your message: "${content}". This is a simulated response.`;
    
    // Add AI response with a small delay to simulate processing
    setTimeout(() => {
      this.addMessage({
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      });
    }, 1000);
  }

  private addMessage(message: Message) {
    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, message]);
  }
}
