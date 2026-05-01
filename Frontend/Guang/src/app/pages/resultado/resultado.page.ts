import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, copyOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-resultado',
  templateUrl: './resultado.page.html',
  styleUrls: ['./resultado.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, RouterModule]
})

export class ResultadoPage implements OnInit {

  textoTranscrito: string = 'Aqui apareceráo texto transcrito da imagem enviada pelo usuário.';

  constructor() {
    addIcons({ arrowBackOutline, copyOutline, saveOutline });
   }

  ngOnInit() {
  }

}
