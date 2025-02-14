resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location
}

module "database" {
  source = "./modules/database"

  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  project_name       = var.project_name
  environment        = var.environment
  admin_username     = var.db_admin_username
  admin_password     = var.db_admin_password
}

module "app_service" {
  source = "./modules/app-service"

  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  project_name       = var.project_name
  environment        = var.environment
  database_url       = module.database.connection_string
}
