import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, imageOutline, cameraOutline, micOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, RouterModule]
})

export class HomePage implements OnInit {

  imagemSelecionada: boolean = false;

  recentes = [
    { nome: 'Receita', tempo: 'há 2 horas'},
    { nome: 'Anotações', tempo: 'ontem'},
    { nome: 'Recibo', tempo: 'há 3 dias'},
  ];

  constructor() {
    addIcons({ personOutline, imageOutline, cameraOutline, micOutline });
   }

  ngOnInit() {
  }

}
