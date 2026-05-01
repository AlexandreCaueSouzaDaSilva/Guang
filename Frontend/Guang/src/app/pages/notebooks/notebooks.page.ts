import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, addOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-notebooks',
  templateUrl: './notebooks.page.html',
  styleUrls: ['./notebooks.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, RouterModule],
})

export class NotebooksPage implements OnInit {

  notebooks = [
    { nome: 'Receitas', total: 3 },
    { nome: 'Trabalho', total: 7 },
    { nome: 'Estudos', total: 2},
  ];

  constructor() { 
    addIcons({ personOutline, addOutline, arrowBackOutline });
  }

  ngOnInit() {
  }

}
