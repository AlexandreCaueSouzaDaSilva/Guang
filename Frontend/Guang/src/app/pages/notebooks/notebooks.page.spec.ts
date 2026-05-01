import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotebooksPage } from './notebooks.page';

describe('NotebooksPage', () => {
  let component: NotebooksPage;
  let fixture: ComponentFixture<NotebooksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotebooksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
