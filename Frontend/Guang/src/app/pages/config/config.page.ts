import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { arrowBackOutline, moonOutline, notificationsOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, RouterModule]
})


export class ConfigPage implements OnInit {

  temaEscuro: boolean = false;
  notificacoes: boolean = true;

  toggleTema() {
    this.temaEscuro = !this.temaEscuro;
    document.body.classList.toggle('dark', this.temaEscuro);
  }

  toggleNotificacoes() {
    this.notificacoes = !this.notificacoes;
  }

  constructor() { 
    addIcons({ arrowBackOutline, moonOutline, notificationsOutline, logOutOutline, trashOutline });
  }

  ngOnInit() {
    this.temaEscuro = document.body.classList.contains('dark');
  }

}
