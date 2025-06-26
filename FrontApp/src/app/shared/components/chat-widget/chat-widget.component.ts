import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgScrollbar } from 'ngx-scrollbar';

export interface Message {
  sender: string;
  text: string;
  time: string;
}

@Component({
    selector: 'app-chat-widget',
    imports: [
        NgScrollbar,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        NgClass,
    ],
    templateUrl: './chat-widget.component.html',
    styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent {
  @Input() avatar: string = 'assets/images/user/user2.jpg';
  @Input() userName: string = 'Aiden Chavez';
  @Input() newMessagesCount: number = 0;

  @Input() messages: Message[] = [];
  @Output() messageSent = new EventEmitter<string>();

  messageText: string = '';

  sendMessage() {
    if (this.messageText.trim()) {
      const newMessage: Message = {
        sender: this.userName,
        text: this.messageText,
        time: new Date().toLocaleTimeString(),
      };
      this.messages.push(newMessage);
      this.messageSent.emit(this.messageText);
      this.messageText = '';
    }
  }
}
