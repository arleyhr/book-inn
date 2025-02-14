variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region where resources will be created"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "admin_username" {
  description = "The administrator username for the MySQL server"
  type        = string
}

variable "admin_password" {
  description = "The administrator password for the MySQL server"
  type        = string
  sensitive   = true
}
