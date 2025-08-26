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
import { TooltipModule } from "primeng/tooltip";

// Interface pour le formulaire (permet Date ou string pour dateOfBirth)
interface AgentForm extends Omit<Agent, "dateOfBirth"> {
  dateOfBirth: string | Date;
}

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
    TooltipModule,
  ],
  templateUrl: "./agents.component.html",
  styleUrls: ["./agents.component.scss"],
  providers: [MessageService],
})
export class AgentsComponent implements OnInit {
  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  currentAgent: AgentForm = this.emptyAgent();
  selectedAgent: Agent | null = null;
  agentToDelete: Agent | null = null;

  isEditing = false;
  showDialog = false;
  showDetailsModal = false;
  showDeleteConfirmation = false;
  isLoading = false;
  searchText = "";

  genders = [
    { label: "Homme", value: "Male" },
    { label: "Femme", value: "Female" },
    { label: "Autre", value: "Other" },
  ];

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

  emptyAgent(): AgentForm {
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
    this.selectedRoles = ["ROLE_USER"]; // Par défaut, nouveau agent a ROLE_USER
    this.isEditing = false;

    // Force modal opening with timeout to ensure proper rendering
    setTimeout(() => {
      this.showDialog = true;
    }, 0);
  }

  showEditDialog(agent: Agent) {
    // Create a deep copy of the agent and convert dateOfBirth to Date for calendar
    this.currentAgent = {
      ...JSON.parse(JSON.stringify(agent)),
      dateOfBirth: new Date(agent.dateOfBirth),
    };

    // Set selected roles for multiselect
    this.selectedRoles = this.currentAgent.roles.map((role) => role.name);
    this.isEditing = true;

    // Force modal opening with timeout to ensure proper rendering
    setTimeout(() => {
      this.showDialog = true;
    }, 0);
  }

  showDetailsDialog(agent: Agent) {
    this.selectedAgent = agent;

    // Force modal opening with timeout to ensure proper rendering
    setTimeout(() => {
      this.showDetailsModal = true;
    }, 0);
  }

  closeDialog() {
    this.showDialog = false;
    this.currentAgent = this.emptyAgent();
    this.selectedRoles = [];
    this.isEditing = false;
  }

  closeDetailsDialog() {
    this.showDetailsModal = false;
    this.selectedAgent = null;
  }

  saveAgent() {
    if (!this.isFormValid()) return;

    // Prepare the agent data for API (convert Date back to string)
    const agentToSave: Agent = {
      ...this.currentAgent,
      dateOfBirth:
        this.currentAgent.dateOfBirth instanceof Date
          ? this.currentAgent.dateOfBirth.toISOString().split("T")[0]
          : this.currentAgent.dateOfBirth,
    };

    // Update roles from selected roles
    if (this.isEditing) {
      agentToSave.roles = this.selectedRoles.map((roleName) => ({
        name: roleName,
      }));
    } else {
      // For new agents, always set ROLE_USER
      agentToSave.roles = [{ name: "ROLE_USER" }];
    }

    const operation = this.isEditing
      ? this.agentService.updateAgent(agentToSave.userId!, agentToSave)
      : this.agentService.createAgent(agentToSave);

    operation.subscribe({
      next: () => {
        this.showSuccess(
          `Agent ${this.isEditing ? "modifié" : "créé"} avec succès`
        );
        this.closeDialog();
        this.loadAllAgents();
      },
      error: (error) => {
        console.error("Error saving agent:", error);
        this.showError(
          `Erreur lors de ${this.isEditing ? "la modification" : "la création"} de l'agent`
        );
      },
    });
  }

  showDeleteConfirmationDialog(agent: Agent) {
    this.agentToDelete = agent;

    // Force modal opening with timeout to ensure proper rendering
    setTimeout(() => {
      this.showDeleteConfirmation = true;
    }, 0);
  }

  confirmDelete() {
    if (!this.agentToDelete?.userId) return;

    this.agentService.deleteAgent(this.agentToDelete.userId).subscribe({
      next: () => {
        this.showSuccess("Agent supprimé avec succès");
        this.cancelDelete();
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
    const requiredFields = [
      this.currentAgent.username,
      this.currentAgent.fullName,
      this.currentAgent.email,
      this.currentAgent.emailPec,
      this.currentAgent.userAddress.country,
      this.currentAgent.userAddress.state,
      this.currentAgent.userAddress.addressLine,
      this.currentAgent.userAddress.zipCode,
    ];

    if (requiredFields.some((field) => !field)) {
      this.showWarn("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    // Validate roles for editing mode
    if (this.isEditing && this.selectedRoles.length === 0) {
      this.showWarn("Veuillez sélectionner au moins un rôle");
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
