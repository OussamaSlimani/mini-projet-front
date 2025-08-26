import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../models/user.model';
import { Table } from 'primeng/table';
import { NgIf } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    BadgeModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUsers: User[] = [];
  showDialog = false;
  isEditing = false;
  currentUser: User = this.getEmptyUser();
  filters: { [key: string]: { value: string } } = {};
  roleOptions = [
    { label: 'Admin', value: UserRole.ADMIN },
    { label: 'User', value: UserRole.USER }
  ];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec du chargement des utilisateurs',
          life: 3000
        });
        console.error(err);
      }
    });
  }

  showAddDialog(): void {
    this.currentUser = this.getEmptyUser();
    this.isEditing = false;
    this.showDialog = true;
  }

  showEditDialog(user: User): void {
    this.currentUser = { ...user };
    this.isEditing = true;
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.currentUser = this.getEmptyUser();
  }

  saveUser(): void {
    if (this.isEditing) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    const { id, createdAt, ...userData } = this.currentUser;
    this.userService.createUser(userData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur créé avec succès',
          life: 3000
        });
        this.loadUsers();
        this.closeDialog();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la création de l\'utilisateur',
          life: 3000
        });
        console.error(err);
      }
    });
  }

  updateUser(): void {
    this.userService.updateUser(this.currentUser.id, this.currentUser).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur mis à jour avec succès',
          life: 3000
        });
        this.loadUsers();
        this.closeDialog();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour de l\'utilisateur',
          life: 3000
        });
        console.error(err);
      }
    });
  }

  confirmDeleteSingle(user: User): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>${user.username}</strong> ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.deleteUser(user.id);
      }
    });
  }

  confirmDeleteMultiple(): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedUsers.length} utilisateurs sélectionnés ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.deleteMultipleUsers();
      }
    });
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur supprimé avec succès',
          life: 3000
        });
        this.loadUsers();
        this.selectedUsers = this.selectedUsers.filter(user => user.id !== id);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la suppression de l\'utilisateur',
          life: 3000
        });
        console.error(err);
      }
    });
  }

  deleteMultipleUsers(): void {
    const deleteObservables = this.selectedUsers.map(user => 
      this.userService.deleteUser(user.id)
    );

    // You might want to use forkJoin here if you want to wait for all deletions to complete
    deleteObservables.forEach(obs => {
      obs.subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
        }
      });
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: `${this.selectedUsers.length} utilisateurs supprimés avec succès`,
      life: 3000
    });
    this.selectedUsers = [];
  }

  onFilter(event: Event, field: string): void {
    const inputElement = event.target as HTMLInputElement;
    this.filters[field] = { value: inputElement.value };
  }

  onRoleFilter(event: any): void {
    this.filters['role'] = { value: event.value };
  }

  isUserSelected(user: User): boolean {
    return this.selectedUsers.some(selected => selected.id === user.id);
  }

  toggleUserSelection(user: User): void {
    if (this.isUserSelected(user)) {
      this.selectedUsers = this.selectedUsers.filter(selected => selected.id !== user.id);
    } else {
      this.selectedUsers = [...this.selectedUsers, user];
    }
  }

  isAllUsersSelected(): boolean {
    return this.selectedUsers.length === this.users.length && this.users.length > 0;
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedUsers = [...this.users];
    } else {
      this.selectedUsers = [];
    }
  }

  getEmptyUser(): User {
    return {
      id: '',
      username: '',
      email: '',
      password: '',
      role: UserRole.USER,
      accountId: null,
      createdAt: ''
    };
  }

  clearFilter(table: Table): void {
    table.clear();
    this.filters = {};
  }
}