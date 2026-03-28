import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    FormsModule, // necessário para ngModel
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton
  ]
})
export class RegisterPage {
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  pin: string = '';

  register() {
    if (this.password !== this.confirmPassword) {
      console.log('As senhas não coincidem!');
      return;
    }
    if (this.pin.length !== 6) {
      console.log('O PIN deve ter 6 dígitos!');
      return;
    }

    console.log('Conta criada:', {
      email: this.email,
      username: this.username,
      password: this.password,
      pin: this.pin
    });
  }
}