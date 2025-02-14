variable "project_name" {
  type    = string
  default = "bookinn"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "location" {
  type    = string
  default = "eastus"
}

variable "db_admin_username" {
  type = string
}

variable "db_admin_password" {
  type      = string
  sensitive = true
}
