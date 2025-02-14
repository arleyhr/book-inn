resource "random_string" "storage_account_name" {
  length  = 8
  special = false
  upper   = false
}

resource "azurerm_resource_group" "tfstate" {
  name     = "terraform-state-rg"
  location = var.location
}

resource "azurerm_storage_account" "tfstate" {
  name                     = "tfstate${random_string.storage_account_name.result}"
  resource_group_name      = azurerm_resource_group.tfstate.name
  location                = azurerm_resource_group.tfstate.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}
