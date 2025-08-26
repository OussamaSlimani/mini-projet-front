// agents.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AgentService } from "../service/AgentService";
import { Agent, UserInfo, UserAddress, Role } from "../models/Agent";
import { MessageService } from "primeng/api";

// PrimeNG Modules
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { MultiSelectModule } from "primeng/multiselect";

@Component({
  selector: "app-agents",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    MultiSelectModule,
  ],
  templateUrl: "./agents.component.html",
  styleUrls: ["./agents.component.scss"],
  providers: [MessageService],
})
export class AgentsComponent implements OnInit {
  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  currentAgent: Agent = this.emptyAgent();
  agentToDelete: Agent | null = null;
  isEditing = false;
  showDialog = false;
  showDeleteConfirmation = false;
  isLoading = false;
  searchText = "";

  genders = ["Male", "Female", "Other"];
  statusOptions = ["active", "inactive", "pending"];
  statusFilterOptions = [
    { label: "Tous les statuts", value: null },
    { label: "Actif", value: "active" },
    { label: "Inactif", value: "inactive" },
  ];

  availableRoles = [
    { name: "ROLE_USER", displayName: "Utilisateur" },
    { name: "ROLE_MODERATOR", displayName: "Modérateur" },
    { name: "ROLE_ADMIN", displayName: "Administrateur" },
  ];

  roleFilterOptions = [
    { label: "Tous les rôles", value: null },
    { label: "Utilisateur", value: "ROLE_USER" },
    { label: "Modérateur", value: "ROLE_MODERATOR" },
    { label: "Administrateur", value: "ROLE_ADMIN" },
  ];

  selectedStatusFilter: any = null;
  selectedRoleFilter: any = null;
  selectedRoles: string[] = [];

  maxBirthDate: Date = new Date();

  constructor(
    private agentService: AgentService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadAllAgents();
  }

  emptyAgent(): Agent {
    return {
      username: "",
      fullName: "",
      gender: "Male",
      email: "",
      emailPec: "",
      dateOfBirth: new Date().toISOString().split("T")[0],
      active: true,
      roles: [{ name: "ROLE_USER" }],
      userInfo: {
        status: "active",
        deleteDate: null,
        adminUser: false,
        emailPecVerified: false,
        temporalPassword: false,
      },
      userAddress: {
        country: "",
        state: "",
        addressLine: "",
        zipCode: 0,
      },
    };
  }

  loadAllAgents() {
    this.isLoading = true;
    this.agentService.getAllAgents().subscribe({
      next: (data) => {
        this.agents = data;
        this.filteredAgents = [...this.agents];
        this.isLoading = false;
      },
      error: () => {
        this.showError("Erreur lors du chargement des agents");
        this.isLoading = false;
      },
    });
  }

  filterAgents() {
    this.filteredAgents = this.agents.filter((agent) => {
      const matchesSearch =
        this.searchText === "" ||
        agent.fullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        agent.userId?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        agent.email.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =
        this.selectedStatusFilter === null ||
        agent.active === (this.selectedStatusFilter === "active");

      const matchesRole =
        this.selectedRoleFilter === null ||
        agent.roles.some((role) => role.name === this.selectedRoleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }

  getRoleDisplayName(roleName: string): string {
    const role = this.availableRoles.find((r) => r.name === roleName);
    return role ? role.displayName : roleName;
  }

  showAddDialog() {
    this.currentAgent = this.emptyAgent();
    this.selectedRoles = this.currentAgent.roles.map((role) => role.name);
    this.isEditing = false;
    this.showDialog = true;
  }

  showEditDialog(agent: Agent) {
    this.currentAgent = { ...agent };
    this.selectedRoles = this.currentAgent.roles.map((role) => role.name);
    this.isEditing = true;
    this.showDialog = true;
  }

  saveAgent() {
    if (!this.isFormValid()) return;

    // Update roles from selected roles
    this.currentAgent.roles = this.selectedRoles.map((roleName) => ({
      name: roleName,
    }));

    const operation = this.isEditing
      ? this.agentService.updateAgent(
          this.currentAgent.userId!,
          this.currentAgent
        )
      : this.agentService.createAgent(this.currentAgent);

    operation.subscribe({
      next: () => {
        this.showSuccess(
          `Agent ${this.isEditing ? "modifié" : "créé"} avec succès`
        );
        this.showDialog = false;
        this.loadAllAgents();
      },
      error: () => {
        this.showError(
          `Erreur lors de ${this.isEditing ? "la modification" : "la création"} de l'agent`
        );
      },
    });
  }

  showDeleteConfirmationDialog(agent: Agent) {
    this.agentToDelete = agent;
    this.showDeleteConfirmation = true;
  }

  confirmDelete() {
    if (!this.agentToDelete?.userId) return;

    this.agentService.deleteAgent(this.agentToDelete.userId).subscribe({
      next: () => {
        this.showSuccess("Agent supprimé avec succès");
        this.showDeleteConfirmation = false;
        this.loadAllAgents();
      },
      error: () => {
        this.showError("Erreur lors de la suppression de l'agent");
      },
    });
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.agentToDelete = null;
  }

  private isFormValid(): boolean {
    if (
      !this.currentAgent.username ||
      !this.currentAgent.fullName ||
      !this.currentAgent.email ||
      !this.currentAgent.emailPec ||
      !this.currentAgent.userAddress.country ||
      !this.currentAgent.userAddress.state ||
      !this.currentAgent.userAddress.addressLine ||
      !this.currentAgent.userAddress.zipCode ||
      this.selectedRoles.length === 0
    ) {
      this.showWarn("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    return true;
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: "success",
      summary: "Succès",
      detail: message,
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: "error",
      summary: "Erreur",
      detail: message,
    });
  }

  private showWarn(message: string) {
    this.messageService.add({
      severity: "warn",
      summary: "Attention",
      detail: message,
    });
  }
}
